import {
  createDraftSafeSelector,
  createEntityAdapter,
  type PayloadAction,
} from "@reduxjs/toolkit"
import { createAppSlice } from "../../app/createAppSlice"
import { type CellRef, parseCellId, resolveCellId } from "../cell/utils"
import { type RootState } from "@/app/store"
import { type Building } from "../production/types"

export interface CreatedBuilding extends Building {
  /**
   * The unique identifier for the building instance.
   */
  id: string

  /**
   * The cell ID where the building is located.
   */
  cellId: string

  /**
   * The slot ID within the cell where the building is placed.
   */
  slotIndex: number
}

export const buildingAdapter = createEntityAdapter<CreatedBuilding>()

type AddBuildingActionPayload = CellRef & {
  building: Building
  slotIndex: number
}

export const buildingSlice = createAppSlice({
  name: "building",
  initialState: buildingAdapter.getInitialState(),
  reducers: {
    addBuilding: (state, action: PayloadAction<AddBuildingActionPayload>) => {
      const { building, cellId, slotIndex } = resolveCellId(action.payload)

      // check if building with same id already exists (spot is already taken)
      const buildingId = `${cellId}:${slotIndex.toString()}`
      if (buildingAdapter.getSelectors().selectById(state, buildingId)) {
        console.warn(`Cannot build anything here, the spot is already taken`)
        return
      }

      buildingAdapter.addOne(state, {
        ...building,
        cellId,
        id: buildingId,
        slotIndex,
      })
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

export const selectBuildingByCellId = createDraftSafeSelector(
  [
    (state: RootState) => selectAllBuildings(state),
    (_, cellId: string) => cellId,
  ],
  (buildings, cellId) => buildings.filter(b => b.cellId === cellId),
)
