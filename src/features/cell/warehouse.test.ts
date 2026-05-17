/*
 * warehouse module tests
 *
 * Behavior-level tests for the pure-function warehouse mechanics module.
 * Tests describe what the warehouse does (claim a buffer, deposit, release,
 * sum a resource across stored and buffer units) — not how it does it. They
 * should survive any internal refactor that preserves the public surface.
 *
 * Test data builders live at the bottom of the file (`emptyUnit`,
 * `storedUnit`, `bufferUnit`, `warehouseOf`) to keep cases readable.
 */
import { describe, it, expect } from "vitest"
import {
  acceptCycle,
  addStored,
  canAcceptCycle,
  canClaimBuffer,
  canDepositIntoBuffer,
  claimBuffer,
  depositIntoBuffer,
  getAvailableSpaceForResource,
  getResourceQuantity,
  releaseBuffer,
  removeStored,
} from "./warehouse"
import { type StorageUnitState, type Warehouse } from "./types"
import { WAREHOUSE_UNIT_CAPACITY } from "@/config"

describe("canClaimBuffer", () => {
  it("is true when at least one empty unit exists", () => {
    const warehouse = warehouseOf([emptyUnit(), storedUnit("Ore", 10)])
    expect(canClaimBuffer(warehouse)).toBe(true)
  })

  it("is false when no empty unit exists", () => {
    const warehouse = warehouseOf([
      storedUnit("Ore", 10),
      bufferUnit("OreExtractor", "Ore", 5),
    ])
    expect(canClaimBuffer(warehouse)).toBe(false)
  })
})

describe("claimBuffer", () => {
  it("converts the first empty unit into a buffer owned by the production", () => {
    const warehouse = warehouseOf([
      storedUnit("Ore", 10),
      emptyUnit(),
      emptyUnit(),
    ])
    const next = claimBuffer(warehouse, "OreExtractor", "Ore")
    expect(next.units).toEqual([
      storedUnit("Ore", 10),
      bufferUnit("OreExtractor", "Ore", 0),
      emptyUnit(),
    ])
  })

  it("does not mutate the input warehouse", () => {
    const warehouse = warehouseOf([emptyUnit()])
    claimBuffer(warehouse, "OreExtractor", "Ore")
    expect(warehouse.units).toEqual([emptyUnit()])
  })

  it("throws when no empty unit is available", () => {
    const warehouse = warehouseOf([
      storedUnit("Ore", 10),
      bufferUnit("OreExtractor", "Ore", 5),
    ])
    expect(() => claimBuffer(warehouse, "GasExtractor", "Gas")).toThrow(
      /no empty unit/i,
    )
  })
})

describe("canDepositIntoBuffer", () => {
  it("is true when the buffer has room for the deposit quantity", () => {
    const warehouse = warehouseOf([
      bufferUnit("OreExtractor", "Ore", WAREHOUSE_UNIT_CAPACITY - 1),
    ])
    expect(canDepositIntoBuffer(warehouse, "OreExtractor", 1)).toBe(true)
  })

  it("is false when the deposit would overflow the buffer's capacity", () => {
    const warehouse = warehouseOf([
      bufferUnit("OreExtractor", "Ore", WAREHOUSE_UNIT_CAPACITY),
    ])
    expect(canDepositIntoBuffer(warehouse, "OreExtractor", 1)).toBe(false)
  })

  it("is false when no buffer exists for the production", () => {
    const warehouse = warehouseOf([storedUnit("Ore", 10), emptyUnit()])
    expect(canDepositIntoBuffer(warehouse, "OreExtractor", 1)).toBe(false)
  })
})

describe("depositIntoBuffer", () => {
  it("increments only the buffer owned by the named production", () => {
    const warehouse = warehouseOf([
      bufferUnit("OreExtractor", "Ore", 2),
      bufferUnit("GasExtractor", "Gas", 0),
      storedUnit("Ore", 10),
    ])
    const next = depositIntoBuffer(warehouse, "OreExtractor", 3)
    expect(next.units).toEqual([
      bufferUnit("OreExtractor", "Ore", 5),
      bufferUnit("GasExtractor", "Gas", 0),
      storedUnit("Ore", 10),
    ])
  })

  it("throws when the deposit would overflow the buffer", () => {
    const warehouse = warehouseOf([
      bufferUnit("OreExtractor", "Ore", WAREHOUSE_UNIT_CAPACITY),
    ])
    expect(() => depositIntoBuffer(warehouse, "OreExtractor", 1)).toThrow(
      /overflow/i,
    )
  })

  it("throws when no buffer exists for the production", () => {
    const warehouse = warehouseOf([storedUnit("Ore", 10), emptyUnit()])
    expect(() => depositIntoBuffer(warehouse, "OreExtractor", 1)).toThrow(
      /no buffer/i,
    )
  })
})

describe("releaseBuffer", () => {
  it("spills the buffer's accumulated content into a stored unit", () => {
    const warehouse = warehouseOf([
      bufferUnit("OreExtractor", "Ore", 5),
      storedUnit("Gas", 2),
    ])
    const next = releaseBuffer(warehouse, "OreExtractor")
    expect(next.units).toEqual([storedUnit("Ore", 5), storedUnit("Gas", 2)])
  })

  it("releases an empty buffer back to an empty unit", () => {
    const warehouse = warehouseOf([bufferUnit("OreExtractor", "Ore", 0)])
    const next = releaseBuffer(warehouse, "OreExtractor")
    expect(next.units).toEqual([emptyUnit()])
  })

  it("throws when no buffer exists for the production", () => {
    const warehouse = warehouseOf([storedUnit("Ore", 10), emptyUnit()])
    expect(() => releaseBuffer(warehouse, "OreExtractor")).toThrow(/no buffer/i)
  })
})

describe("getResourceQuantity", () => {
  it("sums quantities across all stored and buffer units of the resource", () => {
    const warehouse = warehouseOf([
      storedUnit("Ore", 7),
      bufferUnit("OreExtractor", "Ore", 3),
      storedUnit("Ore", 4),
      storedUnit("Gas", 2),
      emptyUnit(),
    ])
    expect(getResourceQuantity(warehouse, "Ore")).toBe(14)
    expect(getResourceQuantity(warehouse, "Gas")).toBe(2)
  })

  it("returns 0 when the resource is not present", () => {
    const warehouse = warehouseOf([storedUnit("Ore", 5), emptyUnit()])
    expect(getResourceQuantity(warehouse, "Crystals")).toBe(0)
  })
})

describe("getAvailableSpaceForResource", () => {
  it("sums room in partial stored units plus full capacity of empty units", () => {
    const warehouse = warehouseOf([
      storedUnit("Ore", WAREHOUSE_UNIT_CAPACITY - 3),
      emptyUnit(),
      emptyUnit(),
    ])
    expect(getAvailableSpaceForResource(warehouse, "Ore")).toBe(
      3 + 2 * WAREHOUSE_UNIT_CAPACITY,
    )
  })

  it("excludes buffers — they are sealed to non-production inputs", () => {
    const warehouse = warehouseOf([
      bufferUnit("OreExtractor", "Ore", 1),
      storedUnit("Ore", 0),
      emptyUnit(),
    ])
    expect(getAvailableSpaceForResource(warehouse, "Ore")).toBe(
      WAREHOUSE_UNIT_CAPACITY + WAREHOUSE_UNIT_CAPACITY,
    )
  })

  it("ignores partial stored units of a different resource", () => {
    const warehouse = warehouseOf([
      storedUnit("Gas", WAREHOUSE_UNIT_CAPACITY - 1),
      emptyUnit(),
    ])
    expect(getAvailableSpaceForResource(warehouse, "Ore")).toBe(
      WAREHOUSE_UNIT_CAPACITY,
    )
  })

  it("returns 0 when the warehouse has no room for the resource", () => {
    const warehouse = warehouseOf([
      storedUnit("Ore", WAREHOUSE_UNIT_CAPACITY),
      storedUnit("Gas", WAREHOUSE_UNIT_CAPACITY),
      bufferUnit("OreExtractor", "Ore", 4),
    ])
    expect(getAvailableSpaceForResource(warehouse, "Ore")).toBe(0)
  })
})

describe("addStored", () => {
  it("fills room in an existing partial stored unit before claiming empties", () => {
    const warehouse = warehouseOf([
      storedUnit("Ore", WAREHOUSE_UNIT_CAPACITY - 2),
      emptyUnit(),
    ])
    const next = addStored(warehouse, "Ore", 2)
    expect(next.units).toEqual([
      storedUnit("Ore", WAREHOUSE_UNIT_CAPACITY),
      emptyUnit(),
    ])
  })

  it("spills into an empty unit when the partial unit overflows", () => {
    const warehouse = warehouseOf([
      storedUnit("Ore", WAREHOUSE_UNIT_CAPACITY - 1),
      emptyUnit(),
    ])
    const next = addStored(warehouse, "Ore", 3)
    expect(next.units).toEqual([
      storedUnit("Ore", WAREHOUSE_UNIT_CAPACITY),
      storedUnit("Ore", 2),
    ])
  })

  it("claims an empty unit when no partial unit exists for the resource", () => {
    const warehouse = warehouseOf([storedUnit("Gas", 3), emptyUnit()])
    const next = addStored(warehouse, "Ore", 4)
    expect(next.units).toEqual([storedUnit("Gas", 3), storedUnit("Ore", 4)])
  })

  it("never deposits into a buffer (sealed)", () => {
    const warehouse = warehouseOf([
      bufferUnit("OreExtractor", "Ore", 1),
      emptyUnit(),
    ])
    const next = addStored(warehouse, "Ore", 2)
    expect(next.units).toEqual([
      bufferUnit("OreExtractor", "Ore", 1),
      storedUnit("Ore", 2),
    ])
  })

  it("throws when no room is available for the quantity", () => {
    const warehouse = warehouseOf([storedUnit("Ore", WAREHOUSE_UNIT_CAPACITY)])
    expect(() => addStored(warehouse, "Ore", 1)).toThrow(/no room/i)
  })
})

describe("removeStored", () => {
  it("decrements from a single stored unit", () => {
    const warehouse = warehouseOf([storedUnit("Ore", 10), storedUnit("Gas", 4)])
    const next = removeStored(warehouse, "Ore", 3)
    expect(next.units).toEqual([storedUnit("Ore", 7), storedUnit("Gas", 4)])
  })

  it("drains across multiple stored units of the same resource", () => {
    const warehouse = warehouseOf([
      storedUnit("Ore", 4),
      storedUnit("Gas", 1),
      storedUnit("Ore", 6),
    ])
    const next = removeStored(warehouse, "Ore", 7)
    expect(next.units).toEqual([
      emptyUnit(),
      storedUnit("Gas", 1),
      storedUnit("Ore", 3),
    ])
  })

  it("never draws from buffers", () => {
    const warehouse = warehouseOf([
      bufferUnit("OreExtractor", "Ore", 5),
      storedUnit("Ore", 2),
    ])
    expect(() => removeStored(warehouse, "Ore", 3)).toThrow(/insufficient/i)
  })

  it("throws when stored quantity is insufficient", () => {
    const warehouse = warehouseOf([storedUnit("Ore", 2)])
    expect(() => removeStored(warehouse, "Ore", 3)).toThrow(/insufficient/i)
  })
})

describe("canAcceptCycle", () => {
  it("is true when the buffer has room for the deposit quantity", () => {
    const warehouse = warehouseOf([
      bufferUnit("OreExtractor", "Ore", WAREHOUSE_UNIT_CAPACITY - 1),
    ])
    expect(canAcceptCycle(warehouse, "OreExtractor", 1)).toBe(true)
  })

  it("is true when the buffer is full and an empty unit exists to roll over to", () => {
    const warehouse = warehouseOf([
      bufferUnit("OreExtractor", "Ore", WAREHOUSE_UNIT_CAPACITY),
      emptyUnit(),
    ])
    expect(canAcceptCycle(warehouse, "OreExtractor", 1)).toBe(true)
  })

  it("is false when the buffer is full and no empty unit exists to roll over to", () => {
    const warehouse = warehouseOf([
      bufferUnit("OreExtractor", "Ore", WAREHOUSE_UNIT_CAPACITY),
      storedUnit("Gas", 4),
    ])
    expect(canAcceptCycle(warehouse, "OreExtractor", 1)).toBe(false)
  })

  it("is false when no buffer exists for the production", () => {
    const warehouse = warehouseOf([storedUnit("Ore", 4), emptyUnit()])
    expect(canAcceptCycle(warehouse, "OreExtractor", 1)).toBe(false)
  })
})

describe("acceptCycle", () => {
  it("deposits into the existing buffer when there is room", () => {
    const warehouse = warehouseOf([
      bufferUnit("OreExtractor", "Ore", 3),
      emptyUnit(),
    ])
    const next = acceptCycle(warehouse, "OreExtractor", 1)
    expect(next.units).toEqual([
      bufferUnit("OreExtractor", "Ore", 4),
      emptyUnit(),
    ])
  })

  it("rolls over at the moment the deposit fills the buffer to capacity", () => {
    // The cycle that takes the buffer exactly to UNIT_CAPACITY immediately
    // converts the full unit to `stored` and claims the next empty unit as
    // a fresh buffer (quantity 0). The next cycle then starts on a visually
    // fresh buffer rather than landing pre-filled in the new unit. This is
    // what makes the "block 0 blinking on a new empty buffer" state visible
    // between rollovers.
    const warehouse = warehouseOf([
      bufferUnit("OreExtractor", "Ore", WAREHOUSE_UNIT_CAPACITY - 1),
      emptyUnit(),
    ])
    const next = acceptCycle(warehouse, "OreExtractor", 1)
    expect(next.units).toEqual([
      storedUnit("Ore", WAREHOUSE_UNIT_CAPACITY),
      bufferUnit("OreExtractor", "Ore", 0),
    ])
  })

  it("rolls-over-then-deposits when the buffer was already full at cycle start", () => {
    // Transition path: a previously halted production (buffer at capacity,
    // no empties available) becomes runnable after an empty appears. The
    // next cycle's acceptCycle first releases the full buffer and claims a
    // new one, then lands the cycle's deposit in the new buffer.
    const warehouse = warehouseOf([
      bufferUnit("OreExtractor", "Ore", WAREHOUSE_UNIT_CAPACITY),
      emptyUnit(),
      storedUnit("Gas", 2),
    ])
    const next = acceptCycle(warehouse, "OreExtractor", 1)
    expect(next.units).toEqual([
      storedUnit("Ore", WAREHOUSE_UNIT_CAPACITY),
      bufferUnit("OreExtractor", "Ore", 1),
      storedUnit("Gas", 2),
    ])
  })

  it("fills the buffer to capacity without rolling over when no empty unit is available", () => {
    // If no empty exists at the moment of fill, the buffer stays at
    // capacity and rollover defers. The next cycle attempt will be halted
    // (canAcceptCycle returns false), and rollover happens only once an
    // empty becomes available.
    const warehouse = warehouseOf([
      bufferUnit("OreExtractor", "Ore", WAREHOUSE_UNIT_CAPACITY - 1),
      storedUnit("Gas", 4),
    ])
    const next = acceptCycle(warehouse, "OreExtractor", 1)
    expect(next.units).toEqual([
      bufferUnit("OreExtractor", "Ore", WAREHOUSE_UNIT_CAPACITY),
      storedUnit("Gas", 4),
    ])
  })

  it("throws when buffer is full and no empty unit exists to roll over to", () => {
    const warehouse = warehouseOf([
      bufferUnit("OreExtractor", "Ore", WAREHOUSE_UNIT_CAPACITY),
      storedUnit("Gas", 4),
    ])
    expect(() => acceptCycle(warehouse, "OreExtractor", 1)).toThrow(
      /cannot accept cycle/i,
    )
  })

  it("throws when no buffer exists for the production", () => {
    const warehouse = warehouseOf([storedUnit("Ore", 4), emptyUnit()])
    expect(() => acceptCycle(warehouse, "OreExtractor", 1)).toThrow(/no buffer/i)
  })
})

// ---- test data builders ----

const emptyUnit = (): StorageUnitState => ({ type: "empty" })

const storedUnit = (resource: string, quantity: number): StorageUnitState => ({
  type: "stored",
  resource,
  quantity,
})

const bufferUnit = (
  productName: string,
  resource: string,
  quantity: number,
): StorageUnitState => ({ type: "buffer", productName, resource, quantity })

const warehouseOf = (units: StorageUnitState[]): Warehouse => ({ units })
