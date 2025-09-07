import { createAppSlice } from "@/app/createAppSlice"
import type { Production } from "./types"
import { buildingSlice } from "../building/buildingSlice"
import { type CellRef, resolveCellId } from "../cell/utils"
import { generateProductionKey } from "./utils"
import { type RootState } from "@/app/store"
import { createEntityAdapter } from "@reduxjs/toolkit"

const productionAdapter = createEntityAdapter({
  selectId: (production: Production) => production.id,
  sortComparer: (a, b) => a.id.localeCompare(b.id),
})

export const productionSlice = createAppSlice({
  name: "production",
  initialState: productionAdapter.getInitialState(),
  reducers: {},
  selectors: {
    getProductionUnitsByCellId: (state, cellRef: CellRef): Production[] => {
      const { cellId } = resolveCellId(cellRef)
      return productionAdapter
        .getSelectors()
        .selectAll(state)
        .filter(p => p.cellId === cellId)
    },
    getProductionIndex: state =>
      productionAdapter.getSelectors().selectEntities(state),
  },
  extraReducers: builder => {
    builder.addCase(buildingSlice.actions.addBuilding, (state, action) => {
      const { building, cellId } = resolveCellId(action.payload)
      const production: Production[] = []
      for (const newProduction of building.production) {
        production.push({
          ...newProduction,
          cellId,
          id: generateProductionKey(cellId, newProduction.name),
          lastProductionTime: new Date().getTime(),
        })
      }
      productionAdapter.addMany(state, production)
    })
  },
})

export const { getProductionUnitsByCellId, getProductionIndex } =
  productionSlice.selectors

export const { selectAll: getProductions } = productionAdapter.getSelectors(
  (state: RootState) => state.production,
)
