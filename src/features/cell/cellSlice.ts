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
} from "./types"
import { getCellId, parseCellId } from "./utils"
import { type RootState } from "@/app/store"
import { TaskSlice } from "../task/taskSlice"

const cellAdapter = createEntityAdapter({
  selectId: (cell: Cell) => cell.id,
  sortComparer: (a, b) => a.id.localeCompare(b.id),
})

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
    },

    terraformCell: (state, action: PayloadAction<{ cellId: string }>) => {
      const { cellId } = action.payload
      const cell = cellAdapter.getSelectors().selectById(state, cellId)

      if (!cell) {
        console.warn(`Cannot terraform cell ${cellId}, cell not found`)
        return
      }

      if (cell.state === HexCellState.DEVELOPED) {
        console.warn(`Cell ${cellId} is already developed`)
        return
      }

      cellAdapter.updateOne(state, {
        id: cellId,
        changes: {
          state: HexCellState.DEVELOPED,
        },
      })
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
  extraReducers: builder => {
    builder.addCase(TaskSlice.actions.completeTask, (state, action) => {
      const { cellId, taskType } = action.payload
      const cell = cellAdapter.getSelectors().selectById(state, cellId)

      if (!cell) {
        console.warn(`cell ${cellId} not found`)
        return
      }

      if (taskType === "TERRAFORM") {
        cellAdapter.updateOne(state, {
          id: cellId,
          changes: {
            state: HexCellState.DEVELOPED,
          },
        })
      } else if (taskType === "PRODUCTION") {
        const { resource } = action.payload
        const currentAmount = cell.warehouse.content[resource] ?? 0
        cellAdapter.updateOne(state, {
          id: cellId,
          changes: {
            warehouse: {
              ...cell.warehouse,
              content: {
                ...cell.warehouse.content,
                [resource]: currentAmount + 1,
              },
            },
          },
        })
      }
    })
  },
})

export const { addCells, terraformCell } = cellSlice.actions
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
        for (const resourceName in c.warehouse.content) {
          acc[resourceName] =
            (acc[resourceName] ?? 0) + (c.warehouse.content[resourceName] ?? 0)
        }
        return acc
      }, {})
  },
)

export const selectCellWarehouseCapacity = createDraftSafeSelector(
  [(state: RootState, cellId: string) => selectCellById(state, cellId)],
  (cell): number => {
    return cell ? cell.warehouse.capacity : 0
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
