/*
 * productionSlice
 *
 * Owns production orders: standing intents to repeatedly produce a resource
 * in a cell. Identified by `(cellId, productName)`. Each order claims a
 * buffer in the cell's warehouse on start and releases it on stop. Halted
 * state is derived (see selectRunningProductionOrders), never stored.
 *
 * Cross-slice coordination: actions on this slice are also reduced by
 * cellSlice via extraReducers (in cellSlice.ts), so a single dispatched
 * action atomically updates both order state and warehouse state.
 *
 * Public API: productionStarted, productionStopped, cycleDeposited,
 * selectProductionOrderByKey, selectRunningProductionOrders,
 * selectCanStartProduction, selectProductionEnergyDraw
 */
import { createAppSlice } from "@/app/createAppSlice"
import {
  createDraftSafeSelector,
  createEntityAdapter,
  type PayloadAction,
} from "@reduxjs/toolkit"
import { type RootState } from "@/app/store"
import { selectCellById, selectCellEntities } from "@/features/cell/cellSlice"
import { canAcceptCycle, canClaimBuffer } from "@/features/cell/warehouse"
import { parseCellId } from "@/features/cell/utils"

// Per-cycle output quantity. Today every production deposits one unit of
// its resource per cycle; once recipes grow an explicit output quantity,
// read it from there.
const CYCLE_OUTPUT_QUANTITY = 1

export interface ProductionOrder {
  id: string // `${cellId}::${productName}`
  cellId: string
  productName: string
  resource: string
  /** ms when the current cycle began */
  startedAt: number
  /** ms per cycle */
  duration: number
  /** energy per second drawn while a cycle is in progress */
  energyUsage: number
}

export const productionOrderKey = (cellId: string, productName: string) =>
  `${cellId}::${productName}`

const productionAdapter = createEntityAdapter<ProductionOrder>({
  sortComparer: (a, b) => a.startedAt - b.startedAt,
})

export const productionSlice = createAppSlice({
  name: "production",
  initialState: productionAdapter.getInitialState(),
  reducers: {
    productionStarted: (
      state,
      action: PayloadAction<{
        cellId: string
        productName: string
        resource: string
        duration: number
        energyUsage: number
      }>,
    ) => {
      const { cellId, productName, resource, duration, energyUsage } =
        action.payload
      const id = productionOrderKey(cellId, productName)
      // Idempotent: re-issuing for an existing order is a no-op so a UI
      // re-render doesn't reset the in-flight cycle's progress bar.
      if (productionAdapter.getSelectors().selectById(state, id)) return
      productionAdapter.addOne(state, {
        id,
        cellId,
        productName,
        resource,
        duration,
        energyUsage,
        startedAt: Date.now(),
      })
    },
    productionStopped: (
      state,
      action: PayloadAction<{ cellId: string; productName: string }>,
    ) => {
      const { cellId, productName } = action.payload
      productionAdapter.removeOne(state, productionOrderKey(cellId, productName))
    },
    cycleDeposited: (
      state,
      action: PayloadAction<{
        cellId: string
        productName: string
        // Quantity carried for the cellSlice side-effect; productionSlice
        // ignores it (cycle bookkeeping is time-based, not quantity-based).
        quantity: number
      }>,
    ) => {
      const { cellId, productName } = action.payload
      productionAdapter.updateOne(state, {
        id: productionOrderKey(cellId, productName),
        changes: { startedAt: Date.now() },
      })
    },
  },
})

export const { productionStarted, productionStopped, cycleDeposited } =
  productionSlice.actions

const orderSelectors = productionAdapter.getSelectors<RootState>(
  state => state.production,
)

export const selectProductionOrderByKey = (
  state: RootState,
  cellId: string,
  productName: string,
): ProductionOrder | undefined =>
  orderSelectors.selectById(state, productionOrderKey(cellId, productName))

export const selectAllProductionOrders = orderSelectors.selectAll

/**
 * All production orders whose buffer can accept another cycle's output.
 * The complement is the halted set — never stored, always derived from
 * current warehouse content. This is the single source of truth for
 * "what's actually producing right now"; the ticker consumes this base,
 * the energy selector consumes the planet-scoped composition below.
 */
export const selectAllRunningProductionOrders = createDraftSafeSelector(
  [
    (state: RootState) => selectAllProductionOrders(state),
    (state: RootState) => selectCellEntities(state),
  ],
  (orders, cellEntities): ProductionOrder[] =>
    orders.filter(order => {
      const cell = cellEntities[order.cellId]
      if (!cell) return false
      // Rollover-aware: a full buffer alongside an empty unit is still a
      // running production — the cycle will atomically release-and-claim
      // before depositing. See ADR-0001 Revision.
      return canAcceptCycle(
        cell.warehouse,
        order.productName,
        CYCLE_OUTPUT_QUANTITY,
      )
    }),
)

export const selectRunningProductionOrders = createDraftSafeSelector(
  [
    (state: RootState) => selectAllRunningProductionOrders(state),
    (_, planetId: number) => planetId,
  ],
  (running, planetId): ProductionOrder[] =>
    running.filter(order => parseCellId(order.cellId).planetId === planetId),
)

/**
 * Whether the player can start a production for `productName` in this cell.
 * Two conditions: no order yet exists (productions are unique per
 * (cell, product)), and the warehouse has at least one empty unit available
 * to claim as the buffer.
 */
export const selectCanStartProduction = (
  state: RootState,
  cellId: string,
  productName: string,
): boolean => {
  if (selectProductionOrderByKey(state, cellId, productName)) return false
  const cell = selectCellById(state, cellId)
  if (!cell) return false
  return canClaimBuffer(cell.warehouse)
}

/**
 * Total energy drawn by all running productions on the planet. Halted
 * productions draw zero — they are not in the running set, so this is just
 * a sum over `selectRunningProductionOrders`.
 */
export const selectProductionEnergyDraw = createDraftSafeSelector(
  [
    (state: RootState, planetId: number) =>
      selectRunningProductionOrders(state, planetId),
  ],
  (running): number =>
    running.reduce((total, order) => total + order.energyUsage, 0),
)
