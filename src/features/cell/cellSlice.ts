import {
  createDraftSafeSelector,
  createEntityAdapter,
  type PayloadAction,
} from "@reduxjs/toolkit"
import { createAppSlice } from "../../app/createAppSlice"
import {
  HexCellState,
  type WarehouseContent,
  type Cell,
  type CellCoord,
  type NewCell,
  type PlanetBoundaries,
  type Habitat,
  type Warehouse,
} from "./types"
import { getCellId, parseCellId } from "./utils"
import {
  acceptCycle,
  addStored,
  claimBuffer,
  getAvailableSpaceForResource,
  getResourceQuantity,
  releaseBuffer,
  removeStored,
} from "./warehouse"
import { type RootState } from "@/app/store"
import { type ProductRecipe } from "../production/types"
import { productionSlice } from "../production/productionSlice"
import { SENSOR_RANGE, WAREHOUSE_UNIT_CAPACITY } from "@/config"
import { computeSensorCoverage } from "../survey/range"
import { getNeighborCoords } from "../map/utils"

const cellAdapter = createEntityAdapter({
  selectId: (cell: Cell) => cell.id,
  sortComparer: (a, b) => a.id.localeCompare(b.id),
})

export type CellIndex = Record<string, Cell | undefined>

// Strict ordering used to enforce knowledge-state stickiness: a cell may only
// move upward through these states (hidden → sighted → surveyed → developed).
// `promoteKnowledgeStates` never downgrades.
const KNOWLEDGE_RANK: Record<HexCellState, number> = {
  [HexCellState.HIDDEN]: 0,
  [HexCellState.SIGHTED]: 1,
  [HexCellState.SURVEYED]: 2,
  [HexCellState.DEVELOPED]: 3,
}

/**
 * Cross-cell coordination: after any mutation that may have changed the set
 * of developed cells on a planet, re-derive which non-developed cells should
 * be at least `sighted` or `surveyed` and promote them. Stickiness lives
 * here — we only promote upward, never downgrade.
 *
 * Operates on the slice's draft state directly (Immer); call it from inside
 * a reducer after `cellAdapter` writes have landed.
 */
function promoteKnowledgeStates(
  state: ReturnType<typeof cellAdapter.getInitialState>,
  planetId: number,
): void {
  const cellsOnPlanet: Cell[] = []
  const developedCellIds = new Set<string>()
  for (const cell of Object.values(state.entities)) {
    if (cell.planetId !== planetId) continue
    cellsOnPlanet.push(cell)
    if (cell.state === HexCellState.DEVELOPED) {
      developedCellIds.add(cell.id)
    }
  }
  if (developedCellIds.size === 0) return

  const getNeighbors = (cellId: string): string[] => {
    const { q, r } = parseCellId(cellId)
    return getNeighborCoords({ q, r }, cellsOnPlanet).map(coord =>
      getCellId(coord, planetId),
    )
  }

  const coverage = computeSensorCoverage(
    developedCellIds,
    SENSOR_RANGE,
    getNeighbors,
  )

  const promote = (cellId: string, atLeast: HexCellState): void => {
    const current = state.entities[cellId]
    if (!current) return
    if (KNOWLEDGE_RANK[current.state] < KNOWLEDGE_RANK[atLeast]) {
      current.state = atLeast
    }
  }
  for (const cellId of coverage.autoSurveyed) promote(cellId, HexCellState.SURVEYED)
  for (const cellId of coverage.sighted) promote(cellId, HexCellState.SIGHTED)
}

export const cellSlice = createAppSlice({
  name: "cell",
  initialState: cellAdapter.getInitialState(),
  reducers: {
    addCells: (
      state,
      action: PayloadAction<{ cells: NewCell[]; planetId: number }>,
    ) => {
      const cells = action.payload.cells.map(
        (c): Cell => ({
          ...c,
          planetId: action.payload.planetId,
          id: getCellId(c, action.payload.planetId),
        }),
      )
      cellAdapter.addMany(state, cells)
      promoteKnowledgeStates(state, action.payload.planetId)
    },

    consumeRecipe: (
      state,
      action: PayloadAction<{
        cellId: string
        recipe: ProductRecipe
        ratio?: number
      }>,
    ) => {
      const { cellId, recipe } = action.payload
      const ratio = action.payload.ratio ?? 1
      const cell = cellAdapter.getSelectors().selectById(state, cellId)

      if (!cell) {
        console.warn(`Cannot consume recipe in cell ${cellId}, cell not found`)
        return
      }

      // Crash-early per ADR-0001: recipe consumption is an internal call
      // path that must have validated inputs upstream. removeStored throws
      // on insufficient quantity rather than silently clamping.
      let warehouse = cell.warehouse
      for (const input of recipe.inputs) {
        const needed = Math.ceil(input.quantity * ratio)
        warehouse = removeStored(warehouse, input.product, needed)
      }
      cellAdapter.updateOne(state, {
        id: cellId,
        changes: { warehouse },
      })
    },

    addToWarehouse: (
      state,
      action: PayloadAction<{
        cellId: string
        resource: string
        quantity: number
      }>,
    ) => {
      const { cellId, resource, quantity } = action.payload
      const cell = cellAdapter.getSelectors().selectById(state, cellId)

      if (!cell) {
        console.warn(
          `Cannot add to warehouse of cell ${cellId}, cell not found`,
        )
        return
      }

      // Best-effort path: clip to available space before delegating to
      // addStored, which crashes on overflow. Non-production callers (gifts,
      // transfers, debug) intentionally accept silent clipping here; the
      // strict deposit path for productions is depositIntoBuffer.
      const available = getAvailableSpaceForResource(cell.warehouse, resource)
      const stored = Math.min(Math.max(quantity, 0), available)
      if (stored <= 0) return

      cellAdapter.updateOne(state, {
        id: cellId,
        changes: { warehouse: addStored(cell.warehouse, resource, stored) },
      })
    },

    cellSurveyed: (state, action: PayloadAction<{ cellId: string }>) => {
      // The completion side of the Survey action. Player-facing entry is a
      // task dispatched against a `sighted` cell beyond auto-survey range;
      // on completion the task dispatches this action.
      //
      // Idempotent: re-dispatching against a `surveyed`/`developed` cell is
      // a no-op (the cell already knows at least as much). Dispatching
      // against a `hidden` cell is rejected — you cannot survey what is not
      // even sighted.
      const { cellId } = action.payload
      const cell = cellAdapter.getSelectors().selectById(state, cellId)

      if (!cell) {
        console.warn(`Cannot survey cell ${cellId}, cell not found`)
        return
      }

      if (KNOWLEDGE_RANK[cell.state] >= KNOWLEDGE_RANK[HexCellState.SURVEYED]) {
        return
      }
      if (cell.state === HexCellState.HIDDEN) {
        console.warn(
          `Cell ${cellId} cannot be surveyed from state ${cell.state}; must be at least ${HexCellState.SIGHTED}`,
        )
        return
      }

      cellAdapter.updateOne(state, {
        id: cellId,
        changes: { state: HexCellState.SURVEYED },
      })
    },

    terraformCell: (state, action: PayloadAction<{ cellId: string }>) => {
      const { cellId } = action.payload
      const cell = cellAdapter.getSelectors().selectById(state, cellId)

      if (!cell) {
        console.warn(`Cannot terraform cell ${cellId}, cell not found`)
        return
      }

      // Terraform now requires a surveyed cell — you cannot terraform what
      // you have not surveyed. See CONTEXT.md (Cell knowledge state) and
      // ADR-0002 §4.
      if (cell.state !== HexCellState.SURVEYED) {
        console.warn(
          `Cell ${cellId} cannot be terraformed from state ${cell.state}; must be ${HexCellState.SURVEYED}`,
        )
        return
      }

      cellAdapter.updateOne(state, {
        id: cellId,
        changes: {
          state: HexCellState.DEVELOPED,
        },
      })
      promoteKnowledgeStates(state, parseCellId(cellId).planetId)
    },
  },

  selectors: {
    getCellByCoord: (
      state,
      planetId: number,
      coord: CellCoord,
    ): Cell | undefined => {
      const id = getCellId(coord, planetId)
      return cellAdapter.getSelectors().selectById(state, id)
    },
    getCellIndex: state => cellAdapter.getSelectors().selectEntities(state),
  },

  // Cross-slice reactions. A production order is owned by productionSlice,
  // but the buffer it occupies lives in the warehouse — these two writes
  // happen as one logical change, so cellSlice listens directly to the
  // productionSlice action rather than relying on a second dispatch.
  extraReducers: builder => {
    builder.addCase(
      productionSlice.actions.productionStarted,
      (state, action) => {
        const { cellId, productName, resource } = action.payload
        const cell = cellAdapter.getSelectors().selectById(state, cellId)
        if (!cell) return
        // Idempotent: a re-dispatch (UI churn, replayed action) must not
        // claim a second buffer for the same production. The action is the
        // standing intent, not the imperative "do the claim now."
        const alreadyClaimed = cell.warehouse.units.some(
          unit => unit.type === "buffer" && unit.productName === productName,
        )
        if (alreadyClaimed) return
        cellAdapter.updateOne(state, {
          id: cellId,
          changes: { warehouse: claimBuffer(cell.warehouse, productName, resource) },
        })
      },
    )
    builder.addCase(
      productionSlice.actions.productionStopped,
      (state, action) => {
        const { cellId, productName } = action.payload
        const cell = cellAdapter.getSelectors().selectById(state, cellId)
        if (!cell) return
        const hasBuffer = cell.warehouse.units.some(
          unit => unit.type === "buffer" && unit.productName === productName,
        )
        if (!hasBuffer) return
        cellAdapter.updateOne(state, {
          id: cellId,
          changes: { warehouse: releaseBuffer(cell.warehouse, productName) },
        })
      },
    )
    builder.addCase(
      productionSlice.actions.cycleDeposited,
      (state, action) => {
        const { cellId, productName, quantity } = action.payload
        const cell = cellAdapter.getSelectors().selectById(state, cellId)
        if (!cell) return
        cellAdapter.updateOne(state, {
          id: cellId,
          changes: {
            warehouse: acceptCycle(cell.warehouse, productName, quantity),
          },
        })
      },
    )
  },
})

export const {
  addCells,
  addToWarehouse,
  cellSurveyed,
  consumeRecipe,
  terraformCell,
} = cellSlice.actions
// export const { getCellByCoord, getCellIndex } = cellSlice.selectors

export const { selectAll: getAllCells, selectById: getCellById } =
  cellAdapter.getSelectors((state: RootState) => state.cell)

const cellSelectors = cellAdapter.getSelectors<RootState>(s => s.cell)

export const {
  selectAll: selectAllCells,
  selectById: selectCellById,
  selectEntities: selectCellEntities,
} = cellSelectors

export const selectCellsByPlanetId = createDraftSafeSelector(
  [
    (state: RootState) => selectAllCells(state),
    (_, planetId: number) => planetId,
  ],
  (cells, planetId) => cells.filter(c => c.planetId === planetId),
)

export const selectCellByCoords = createDraftSafeSelector(
  [
    (state: RootState) => selectCellEntities(state),
    (_, coords: CellCoord) => coords,
    (_, _coords, planetId: number) => planetId,
  ],
  (cellIndex, coords, planetId) => {
    const id = getCellId(coords, planetId)
    return cellIndex[id]
  },
)

export const selectPlanetBoundaries = createDraftSafeSelector(
  [
    (state: RootState) => selectAllCells(state),
    (_, planetId: number) => planetId,
  ],
  (cells, planetId): PlanetBoundaries => {
    const planetCells = cells.filter(c => c.planetId === planetId)
    const qMin = Math.min(...planetCells.map(c => c.q))
    const qMax = Math.max(...planetCells.map(c => c.q))
    const rMin = Math.min(...planetCells.map(c => c.r))
    const rMax = Math.max(...planetCells.map(c => c.r))
    return { qMin, qMax, rMin, rMax }
  },
)

export const selectNeighborCells = createDraftSafeSelector(
  [
    (state: RootState) => selectCellEntities(state),
    (state: RootState, cellId: string) => {
      const { planetId } = parseCellId(cellId)
      return selectCellsByPlanetId(state, planetId)
    },
    (_, cellId: string) => cellId,
  ],
  (cellIndex, planetCells, cellId) => {
    const { q, r, planetId } = parseCellId(cellId)

    const wrapR = (qValue: number, r: number) => {
      const rValues = planetCells.filter(c => c.q === qValue).map(c => c.r)
      const rMin = Math.min(...rValues)
      const rMax = Math.max(...rValues)
      return r < rMin ? rMax : r > rMax ? rMin : r
    }

    const wrapQ = (rValue: number, q: number) => {
      const qValues = planetCells.filter(c => c.r === rValue).map(c => c.q)
      const qMin = Math.min(...qValues)
      const qMax = Math.max(...qValues)
      return q < qMin ? qMax : q > qMax ? qMin : q
    }

    const rawNeighbors = [
      { q: wrapQ(r, q + 1), r },
      { q: wrapQ(r, q - 1), r },
      { q, r: wrapR(q, r + 1) },
      { q, r: wrapR(q, r - 1) },
      { q: wrapQ(r, q + 1), r: wrapR(wrapQ(r, q + 1), r - 1) },
      { q: wrapQ(r, q - 1), r: wrapR(wrapQ(r, q - 1), r + 1) },
    ]

    return rawNeighbors
      .map(n => getCellId(n, planetId))
      .map(coord => cellIndex[coord])
  },
)

export const selectHasClaimedNeighbor = createDraftSafeSelector(
  [(state: RootState, cellId: string) => selectNeighborCells(state, cellId)],
  neighbors => {
    return neighbors.some(n => n?.state === HexCellState.DEVELOPED)
  },
)

export const selectPlanetWarehousesContent = createDraftSafeSelector(
  [
    (state: RootState) => selectAllCells(state),
    (_, planetId: number) => planetId,
  ],
  (cells, planetId): WarehouseContent => {
    return cells
      .filter(c => c.planetId === planetId)
      .reduce((acc: WarehouseContent, c: Cell) => {
        for (const unit of c.warehouse.units) {
          if (unit.type === "empty") continue
          acc[unit.resource] = (acc[unit.resource] ?? 0) + unit.quantity
        }
        return acc
      }, {})
  },
)

export const selectCellWarehouseCapacity = createDraftSafeSelector(
  [(state: RootState, cellId: string) => selectCellById(state, cellId)],
  (cell): number => {
    return cell ? cell.warehouse.units.length * WAREHOUSE_UNIT_CAPACITY : 0
  },
)

export const selectPlanetHabitation = createDraftSafeSelector(
  [
    (state: RootState, planetId: number) =>
      selectCellsByPlanetId(state, planetId),
  ],
  (cells): Habitat => {
    return cells.reduce(
      (acc: Habitat, cell) => {
        acc.population += cell.habitat.population
        acc.capacity += cell.habitat.capacity
        return acc
      },
      { population: 0, capacity: 0 },
    )
  },
)

/**
 * Check if a warehouse can produce a given recipe
 * Returns the name of the first missing product
 */
export const getMissingProductForRecipe = (
  warehouse: Warehouse,
  recipe: ProductRecipe,
  ratio = 1,
): null | string => {
  for (const input of recipe.inputs) {
    const available = getResourceQuantity(warehouse, input.product)
    if (available < Math.ceil(input.quantity * ratio)) {
      return input.product
    }
  }
  return null
}

export const terraformRecipe: ProductRecipe = {
  inputs: [
    {
      product: "Gas",
      quantity: 20,
    },
    { product: "Ore", quantity: 50 },
  ],
  energy: 100,
  buildTime: 60,
}
