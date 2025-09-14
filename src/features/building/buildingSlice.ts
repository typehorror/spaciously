import {
  createDraftSafeSelector,
  createEntityAdapter,
  type PayloadAction,
} from "@reduxjs/toolkit"
import { createAppSlice } from "../../app/createAppSlice"
import type { Building, NewBuilding } from "./types"
import { type CellRef, parseCellId, resolveCellId } from "../cell/utils"
import { type RootState } from "@/app/store"

export const buildingAdapter = createEntityAdapter({
  selectId: (building: Building) => building.cellId,
  sortComparer: (a, b) => a.cellId.localeCompare(b.cellId),
})

type AddBuildingPayload = CellRef & { building: NewBuilding }

export const buildingSlice = createAppSlice({
  name: "building",
  initialState: buildingAdapter.getInitialState(),
  reducers: {
    addBuilding: (state, action: PayloadAction<AddBuildingPayload>) => {
      const { building, cellId } = resolveCellId(action.payload)
      buildingAdapter.addOne(state, { ...building, cellId })
    },
  },
})

export const { addBuilding } = buildingSlice.actions

const buildingSelectors = buildingAdapter.getSelectors<RootState>(
  s => s.building,
)

export const {
  selectAll: selectAllBuildings,
  selectById: selectBuildingById,
  selectEntities: selectBuildingEntities,
} = buildingSelectors

export const selectBuildingsByPlanetId = createDraftSafeSelector(
  [
    (state: RootState) => selectAllBuildings(state),
    (_, planetId: number) => planetId,
  ],
  (buildings, planetId) =>
    buildings.filter(b => parseCellId(b.cellId).planetId === planetId),
)
