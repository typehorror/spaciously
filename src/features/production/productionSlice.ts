import { createAppSlice } from "@/app/createAppSlice"
import type { Production } from "./types"
import { buildingSlice } from "../building/buildingSlice"
import { type CellRef, resolveCellId } from "../cell/utils"
import { generateProductionKey } from "./utils"
import { type RootState } from "@/app/store"
import { createDraftSafeSelector, createEntityAdapter } from "@reduxjs/toolkit"

const productionAdapter = createEntityAdapter({
  selectId: (production: Production) => production.id,
  sortComparer: (a, b) => a.id.localeCompare(b.id),
})

export const productionSlice = createAppSlice({
  name: "production",
  initialState: productionAdapter.getInitialState(),
  reducers: {},
  selectors: {
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

const productionSelectors = productionAdapter.getSelectors<RootState>(
  s => s.production,
)

export const {
  selectAll: selectAllProductions,
  selectById: selectProductionById,
  selectEntities: selectProductionEntities,
} = productionSelectors

export const selectProductionUnitsByCellId = createDraftSafeSelector(
  [
    (state: RootState) => selectAllProductions(state),
    (_: RootState, cellRef: CellRef) => cellRef,
  ],
  (productions, cellRef): Production[] => {
    const { cellId } = resolveCellId(cellRef)
    return productions.filter(p => p.cellId === cellId)
  },
)
