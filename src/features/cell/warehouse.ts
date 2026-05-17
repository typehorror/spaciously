/*
 * warehouse mechanics
 *
 * Pure-function module operating on the typed-units Warehouse shape. The
 * single source of truth for buffer accounting (claim / release / deposit),
 * derived resource quantities, and available space.
 *
 * Mutations return a new Warehouse and crash early with informative errors
 * when invariants are violated (e.g. claiming a buffer with no empty unit,
 * depositing past WAREHOUSE_UNIT_CAPACITY). Callers are expected to gate on
 * the matching `can*` query when the operation is best-effort.
 *
 * See docs/adr/0001-buffered-production-with-derived-halt.md for the
 * rationale behind the typed-units shape and the sealed-buffer invariant.
 *
 * Public API: canClaimBuffer, claimBuffer, canDepositIntoBuffer,
 * depositIntoBuffer, releaseBuffer, canAcceptCycle, acceptCycle,
 * getResourceQuantity, getAvailableSpaceForResource, addStored, removeStored
 */
import { type StorageUnitState, type Warehouse } from "./types"
import { WAREHOUSE_UNIT_CAPACITY } from "@/config"

type BufferUnit = Extract<StorageUnitState, { type: "buffer" }>

const findBuffer = (
  warehouse: Warehouse,
  productName: string,
): BufferUnit | undefined =>
  warehouse.units.find(
    (unit): unit is BufferUnit =>
      unit.type === "buffer" && unit.productName === productName,
  )

export const canClaimBuffer = (warehouse: Warehouse): boolean =>
  warehouse.units.some(unit => unit.type === "empty")

/**
 * Reserve the first empty storage unit as a buffer owned by `productName` for
 * `resource`. The buffer starts at quantity 0; cycles deposit into it via
 * `depositIntoBuffer`. Crashes when no empty unit is available — callers
 * should gate on `canClaimBuffer` when the operation is best-effort.
 */
export const claimBuffer = (
  warehouse: Warehouse,
  productName: string,
  resource: string,
): Warehouse => {
  const targetIndex = warehouse.units.findIndex(unit => unit.type === "empty")
  if (targetIndex === -1) {
    throw new Error(
      `Cannot claim buffer for production "${productName}": no empty unit available.`,
    )
  }
  const claimed: StorageUnitState = {
    type: "buffer",
    productName,
    resource,
    quantity: 0,
  }
  const units = warehouse.units.map((unit, index) =>
    index === targetIndex ? claimed : unit,
  )
  return { ...warehouse, units }
}

/**
 * Whether the buffer owned by `productName` can accept `quantity` more units
 * of its resource without exceeding `WAREHOUSE_UNIT_CAPACITY`. This is the
 * halt rule — a production is halted iff this is false for its next cycle.
 * Returns false when no buffer exists for `productName`.
 */
export const canDepositIntoBuffer = (
  warehouse: Warehouse,
  productName: string,
  quantity: number,
): boolean => {
  const buffer = findBuffer(warehouse, productName)
  if (!buffer) return false
  return buffer.quantity + quantity <= WAREHOUSE_UNIT_CAPACITY
}

/**
 * Add `quantity` of the buffer's resource to the production's buffer. Crashes
 * on overflow or when no buffer exists for `productName` — callers running
 * cycles should gate on `canDepositIntoBuffer` (which is also what derives the
 * halted state in the production slice).
 */
export const depositIntoBuffer = (
  warehouse: Warehouse,
  productName: string,
  quantity: number,
): Warehouse => {
  const targetIndex = warehouse.units.findIndex(
    (unit): unit is BufferUnit =>
      unit.type === "buffer" && unit.productName === productName,
  )
  if (targetIndex === -1) {
    throw new Error(
      `Cannot deposit into production "${productName}": no buffer claimed in this warehouse.`,
    )
  }
  const buffer = warehouse.units[targetIndex] as BufferUnit
  const nextQuantity = buffer.quantity + quantity
  if (nextQuantity > WAREHOUSE_UNIT_CAPACITY) {
    throw new Error(
      `Cannot deposit ${String(quantity)} into "${productName}" buffer: would overflow (current ${String(buffer.quantity)}, capacity ${String(WAREHOUSE_UNIT_CAPACITY)}).`,
    )
  }
  const updated: BufferUnit = { ...buffer, quantity: nextQuantity }
  const units = warehouse.units.map((unit, index) =>
    index === targetIndex ? updated : unit,
  )
  return { ...warehouse, units }
}

/**
 * Whether the production can accept another cycle's output in this
 * warehouse. True when the buffer has room for `quantity`, OR the buffer
 * is full and an empty unit exists to roll over to. This is the running
 * predicate consumed by `selectAllRunningProductionOrders`; halted is just
 * the complement.
 *
 * See the Revision section of ADR-0001 for why rollover replaced hard-cap.
 */
export const canAcceptCycle = (
  warehouse: Warehouse,
  productName: string,
  quantity: number,
): boolean => {
  const buffer = findBuffer(warehouse, productName)
  if (!buffer) return false
  if (buffer.quantity + quantity <= WAREHOUSE_UNIT_CAPACITY) return true
  return canClaimBuffer(warehouse)
}

/**
 * Apply one cycle's output to the production's buffer.
 *
 * Two paths:
 * - **Normal**: the deposit fits in the current buffer. After depositing,
 *   if the buffer is now exactly full AND an empty unit is available,
 *   immediately roll over — release the full unit as `stored` and claim
 *   the next empty as a fresh buffer. This makes the rollover visible at
 *   the moment of fill, so the next cycle starts on a quantity-0 buffer
 *   (block 0 ready to be filled) rather than landing pre-filled in the
 *   new unit.
 * - **Transition**: the current buffer was already at capacity at cycle
 *   start (a previously halted production becoming runnable). Release-
 *   then-claim first, then deposit into the new buffer.
 *
 * Crashes when there is no buffer for `productName`, or when the buffer
 * is full and no empty unit is available to roll over to (callers should
 * gate on `canAcceptCycle`).
 */
export const acceptCycle = (
  warehouse: Warehouse,
  productName: string,
  quantity: number,
): Warehouse => {
  const buffer = findBuffer(warehouse, productName)
  if (!buffer) {
    throw new Error(
      `Cannot accept cycle for "${productName}": no buffer claimed in this warehouse.`,
    )
  }

  // Transition path: buffer was already full before this cycle. Rollover
  // first, then deposit into the freshly claimed buffer.
  if (buffer.quantity >= WAREHOUSE_UNIT_CAPACITY) {
    if (!canClaimBuffer(warehouse)) {
      throw new Error(
        `Cannot accept cycle for "${productName}": buffer is full and no empty unit available to roll over to.`,
      )
    }
    const released = releaseBuffer(warehouse, productName)
    const reclaimed = claimBuffer(released, productName, buffer.resource)
    return depositIntoBuffer(reclaimed, productName, quantity)
  }

  // Partial overflows aren't a supported cycle shape yet (cycle quantity
  // is always 1 today). When multi-unit outputs land, decide explicitly
  // whether to split or refuse.
  if (buffer.quantity + quantity > WAREHOUSE_UNIT_CAPACITY) {
    throw new Error(
      `Cannot accept cycle for "${productName}": deposit of ${String(quantity)} exceeds remaining capacity (current ${String(buffer.quantity)}/${String(WAREHOUSE_UNIT_CAPACITY)}).`,
    )
  }

  let result = depositIntoBuffer(warehouse, productName, quantity)

  // Rollover-on-fill: if the deposit just filled the buffer exactly to
  // capacity AND an empty exists, release it now so the next cycle starts
  // visually fresh on a new buffer. If no empty is available, leave it at
  // capacity — the next cycle will be halted until storage frees up.
  const filled = findBuffer(result, productName)
  if (
    filled &&
    filled.quantity >= WAREHOUSE_UNIT_CAPACITY &&
    canClaimBuffer(result)
  ) {
    result = releaseBuffer(result, productName)
    result = claimBuffer(result, productName, filled.resource)
  }

  return result
}

/**
 * Release the buffer owned by `productName`. Accumulated content spills into
 * a `stored` unit of the same resource; an empty buffer collapses back to an
 * `empty` unit. Crashes when no buffer exists for `productName`.
 *
 * The spill is intentional: produced output is real player inventory and
 * should not be discarded when a production is stopped.
 */
export const releaseBuffer = (
  warehouse: Warehouse,
  productName: string,
): Warehouse => {
  const targetIndex = warehouse.units.findIndex(
    (unit): unit is BufferUnit =>
      unit.type === "buffer" && unit.productName === productName,
  )
  if (targetIndex === -1) {
    throw new Error(
      `Cannot release buffer for production "${productName}": no buffer claimed in this warehouse.`,
    )
  }
  const buffer = warehouse.units[targetIndex] as BufferUnit
  const replacement: StorageUnitState =
    buffer.quantity === 0
      ? { type: "empty" }
      : { type: "stored", resource: buffer.resource, quantity: buffer.quantity }
  const units = warehouse.units.map((unit, index) =>
    index === targetIndex ? replacement : unit,
  )
  return { ...warehouse, units }
}

/**
 * Total quantity of `resource` held across both stored units and buffers.
 * Both kinds count toward player-facing inventory (see CONTEXT.md relations).
 */
export const getResourceQuantity = (
  warehouse: Warehouse,
  resource: string,
): number =>
  warehouse.units.reduce((total, unit) => {
    if (unit.type === "empty") return total
    if (unit.resource !== resource) return total
    return total + unit.quantity
  }, 0)

/**
 * How much more of `resource` can be added to general storage. Sums the
 * remaining room in partial `stored` units of the resource and the full
 * `WAREHOUSE_UNIT_CAPACITY` of each `empty` unit. Buffers are excluded —
 * they are sealed to all inputs other than their owning production.
 */
export const getAvailableSpaceForResource = (
  warehouse: Warehouse,
  resource: string,
): number =>
  warehouse.units.reduce((space, unit) => {
    if (unit.type === "empty") return space + WAREHOUSE_UNIT_CAPACITY
    if (unit.type === "stored" && unit.resource === resource) {
      return space + (WAREHOUSE_UNIT_CAPACITY - unit.quantity)
    }
    return space
  }, 0)

/**
 * Add `quantity` of `resource` to general storage. Fills partial `stored`
 * units of the resource first, then claims `empty` units. Buffers are never
 * touched — they are the production's sealed output destination.
 *
 * Crashes when the warehouse cannot accept the full quantity. Per
 * ADR-0001, non-production deposit paths fail loudly rather than silently
 * clipping; callers should gate on `getAvailableSpaceForResource` when the
 * write is best-effort.
 */
export const addStored = (
  warehouse: Warehouse,
  resource: string,
  quantity: number,
): Warehouse => {
  if (quantity <= 0) return warehouse
  if (getAvailableSpaceForResource(warehouse, resource) < quantity) {
    throw new Error(
      `Cannot add ${String(quantity)} of "${resource}" to warehouse: no room.`,
    )
  }
  let remaining = quantity
  const units = warehouse.units.map((unit): StorageUnitState => {
    if (remaining === 0) return unit
    if (unit.type === "stored" && unit.resource === resource) {
      const room = WAREHOUSE_UNIT_CAPACITY - unit.quantity
      const take = Math.min(room, remaining)
      remaining -= take
      return { ...unit, quantity: unit.quantity + take }
    }
    return unit
  })
  if (remaining > 0) {
    for (let index = 0; index < units.length && remaining > 0; index++) {
      const current = units[index]
      if (current?.type === "empty") {
        const take = Math.min(WAREHOUSE_UNIT_CAPACITY, remaining)
        units[index] = { type: "stored", resource, quantity: take }
        remaining -= take
      }
    }
  }
  return { ...warehouse, units }
}

const sumStored = (warehouse: Warehouse, resource: string): number =>
  warehouse.units.reduce((total, unit) => {
    if (unit.type === "stored" && unit.resource === resource) {
      return total + unit.quantity
    }
    return total
  }, 0)

/**
 * Remove `quantity` of `resource` from general storage. Drains from `stored`
 * units only — buffers are never touched, so a production's accumulated
 * output is not silently siphoned by recipe consumption. A `stored` unit that
 * empties collapses back to `empty`.
 *
 * Crashes when stored quantity (excluding buffers) is insufficient.
 */
export const removeStored = (
  warehouse: Warehouse,
  resource: string,
  quantity: number,
): Warehouse => {
  if (quantity <= 0) return warehouse
  if (sumStored(warehouse, resource) < quantity) {
    throw new Error(
      `Cannot remove ${String(quantity)} of "${resource}" from warehouse: insufficient stored quantity.`,
    )
  }
  let remaining = quantity
  const units = warehouse.units.map((unit): StorageUnitState => {
    if (remaining === 0) return unit
    if (unit.type !== "stored" || unit.resource !== resource) return unit
    const take = Math.min(unit.quantity, remaining)
    remaining -= take
    const nextQuantity = unit.quantity - take
    return nextQuantity === 0
      ? { type: "empty" }
      : { ...unit, quantity: nextQuantity }
  })
  return { ...warehouse, units }
}
