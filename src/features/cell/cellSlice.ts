import {
  createDraftSafeSelector,
  createEntityAdapter,
  type PayloadAction,
} from "@reduxjs/toolkit"
import { createAppSlice } from "../../app/createAppSlice"
import type { Cell, CellCoord, NewCell, PlanelBoundaries } from "./types"
import { getCellId, parseCellId } from "./utils"
import { type RootState } from "@/app/store"

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
})

export const { addCells } = cellSlice.actions
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
  (cells, planetId): PlanelBoundaries => {
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
    return neighbors.some(n => n.state === "claimed")
  },
)
