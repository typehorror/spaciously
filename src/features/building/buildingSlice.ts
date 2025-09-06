import { createSelector, type PayloadAction } from "@reduxjs/toolkit"
import { createAppSlice } from "../../app/createAppSlice"
import type { Building, NewBuilding } from "./types"
import { type CellRef, getCellCoordFromId, resolveCellId } from "../cell/utils"
import {
  type AllResourceNames,
  GeneratedResourceName,
} from "../resources/types"
import { type RootState } from "@/app/store"

type BuildingState = {
  buildingIndex: Record<string, Building | undefined>
  buildingByPlanet: Record<number, Building[]>
}

const initialState: BuildingState = {
  buildingIndex: {},
  buildingByPlanet: {},
}

type AddBuildingPayload = CellRef & { building: NewBuilding }

export const buildingSlice = createAppSlice({
  name: "building",
  initialState,
  reducers: {
    addBuilding: (state, action: PayloadAction<AddBuildingPayload>) => {
      const { building, cellId } = resolveCellId(action.payload)

      const newBuilding = { ...building, cellId }

      // index by cellId
      state.buildingIndex[cellId] = newBuilding

      // index by planetId
      const planetId = getCellCoordFromId(cellId).planetId
      state.buildingByPlanet[planetId] ??= []
      state.buildingByPlanet[planetId].push(newBuilding)
    },
    produceResource: (
      state,
      action: PayloadAction<{
        cellId: string
        resourceName: AllResourceNames
        amount: number
      }>,
    ) => {
      const { cellId, resourceName, amount } = action.payload
      const building = state.buildingIndex[cellId]
      if (building) {
        switch (resourceName) {
          case GeneratedResourceName.POPULATION:
            building.habitat.population =
              (building.habitat.population || 0) + amount
            break
          case GeneratedResourceName.ENERGY:
            // TODO: energy production is added to the planet
            break
          default:
            building.warehouse.content[resourceName] =
              (building.warehouse.content[resourceName] ?? 0) + amount
        }
      }
    },
  },
  selectors: {
    getBuildingById: (state, cellRef: CellRef) => {
      const { cellId } = resolveCellId(cellRef)
      return state.buildingIndex[cellId]
    },
    getBuildingByPlanetId: (state, planetId: number) =>
      state.buildingByPlanet[planetId] ?? [],
  },
})

export const getBuildings = createSelector(
  (state: RootState) => state.building.buildingIndex,
  buildingIndex => Object.values(buildingIndex),
)

export const { addBuilding } = buildingSlice.actions
export const { getBuildingById, getBuildingByPlanetId } =
  buildingSlice.selectors
