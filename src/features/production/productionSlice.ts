import { createAppSlice } from "@/app/createAppSlice"
import type { Production } from "./types"
import { buildingSlice } from "../building/buildingSlice"
import { type CellRef, resolveCellId } from "../cell/utils"
import { generateProductionKey } from "./utils"
import { type RootState } from "@/app/store"
import { createSelector } from "@reduxjs/toolkit"

export type ProductionIndex = Record<string, Production | undefined>
type ProductionSlice = {
  productionCellIndex: Record<string, Production[] | undefined>
  productionIndex: ProductionIndex
}

const initialState: ProductionSlice = {
  productionCellIndex: {},
  productionIndex: {},
}

export const productionSlice = createAppSlice({
  name: "production",
  initialState,
  reducers: {},
  selectors: {
    getProductionUnitsByCellId: (state, cellRef: CellRef): Production[] => {
      const { cellId } = resolveCellId(cellRef)
      return state.productionCellIndex[cellId] ?? []
    },
    getProductionIndex: state => state.productionIndex,
  },
  extraReducers: builder => {
    builder.addCase(buildingSlice.actions.addBuilding, (state, action) => {
      const { building, cellId } = resolveCellId(action.payload)
      for (const newProduction of building.production) {
        const production = {
          ...newProduction,
          cellId,
          id: generateProductionKey(cellId, newProduction.name),
        }

        state.productionIndex[production.id] = production

        const cellProduction = [
          ...(state.productionCellIndex[cellId] ?? []),
          production,
        ]
        // always sort by name
        cellProduction.sort((a, b) => a.name.localeCompare(b.name))

        state.productionCellIndex[cellId] = cellProduction
      }
    })
  },
})

export const getProductions = createSelector(
  (state: RootState) => state.production.productionIndex,
  productionIndex => Object.values(productionIndex),
)

export const { getProductionUnitsByCellId, getProductionIndex } =
  productionSlice.selectors
