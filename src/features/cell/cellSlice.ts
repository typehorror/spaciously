import { createSelector, type PayloadAction } from "@reduxjs/toolkit"
import { createAppSlice } from "../../app/createAppSlice"
import type { Cell, CellCoord, NewCell } from "./types"
import { getCellId } from "./utils"
import { type RootState } from "@/app/store"
import { filter } from "lodash"

export type CellIndex = Partial<Record<string, Cell>>

type CellState = {
  cellIndex: CellIndex
}

const initialState: CellState = {
  cellIndex: {},
}

export const cellSlice = createAppSlice({
  name: "cell",
  initialState,
  reducers: {
    addCells: (
      state,
      action: PayloadAction<{ cells: NewCell[]; planetId: number }>,
    ) => {
      const { cells, planetId } = action.payload

      // prevent overwriting existing cells
      // if (planetId in state.cellByPlanet) {
      //   throw new Error(`Cells for planet ${planetId.toString()} already set`)
      // }
      // state.cellByPlanet[planetId] = []

      for (const newCell of cells) {
        const cell = {
          buildingId: null,
          ...newCell,
          planetId: planetId,
          id: getCellId(newCell, planetId),
        }
        state.cellIndex[cell.id] = cell
        // state.cellByPlanet[planetId].push(cell)
      }
    },
  },

  selectors: {
    getCellIndex: (state): CellIndex => state.cellIndex,
    getCellById: (state, id: string) => state.cellIndex[id],
    getCellByCoord: (
      state,
      planetId: number,
      coord: CellCoord,
    ): Cell | undefined => {
      const id = getCellId(coord, planetId)
      return state.cellIndex[id]
    },
  },
})

export const { addCells } = cellSlice.actions
export const { getCellById, getCellByCoord, getCellIndex } = cellSlice.selectors

export const getCellsByPlanetId = createSelector(
  (state: RootState, planetId: number): Cell[] | undefined =>
    Object.values(state.cell.cellIndex)
      .filter(c => c !== undefined)
      .filter(c => c.planetId === planetId),
  cells => cells ?? [],
)

type CellIdOrCoord = { cellId: string } | { coord: CellCoord; planetId: number }
/**
 * Extracts the cell information from any Cell referencing payload,
 * regardless of whether it's provided by coordinate/planetId or cellId.
 *
 * @param payload The payload containing building and cell information.
 * @returns An object containing the extracted cellId and building.
 */
export function resolveCellId<T extends CellIdOrCoord>(
  input: T,
): T & { cellId: string } {
  if ("cellId" in input) {
    return { ...input, cellId: input.cellId }
  }
  return {
    ...input,
    cellId: getCellId(input.coord, input.planetId),
  }
}
