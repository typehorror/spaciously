import {
  createDraftSafeSelector,
  createEntityAdapter,
  type PayloadAction,
} from "@reduxjs/toolkit"
import { createAppSlice } from "../../app/createAppSlice"
import type { Cell, CellCoord, NewCell } from "./types"
import { getCellId } from "./utils"
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

// export const getCellsByPlanetId = createDraftSafeSelector(
//   [
//     (state: RootState) => cellAdapter.getSelectors().selectAll(state.cell),
//     (_: RootState, planetId: number) => planetId,
//   ],
//   (cells, planetId) => cells.filter(c => c.planetId === planetId),
// )

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
