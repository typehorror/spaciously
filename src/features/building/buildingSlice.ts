import { createEntityAdapter, type PayloadAction } from "@reduxjs/toolkit"
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
  selectors: {
    getBuildingByPlanetId: (state, planetId: number): Building[] => {
      return buildingAdapter
        .getSelectors()
        .selectAll(state)
        .filter(b => parseCellId(b.cellId).planetId === planetId)
    },
  },
})

export const { addBuilding } = buildingSlice.actions
export const { getBuildingByPlanetId } = buildingSlice.selectors

export const { selectAll: getBuildings, selectById: getBuildingById } =
  buildingAdapter.getSelectors((state: RootState) => state.building)
