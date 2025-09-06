import { createAppSlice } from "@/app/createAppSlice"
import type { WarehouseContent } from "./types"
import { buildingSlice } from "../building/buildingSlice"
import { resolveCellId } from "../cell/utils"
import { type RootState } from "@/app/store"
import { createSelector } from "@reduxjs/toolkit"
import { producerSlice } from "../production/producerSlice"
import { parseProductionKey } from "../production/utils"
import { getAvailableSpaceForResource } from "./utils"
import { GeneratedResourceName } from "../resources/types"

export type ProductionIndex = Record<string, WarehouseContent | undefined>
type WarehouseSlice = {
  contentIndex: Record<string, WarehouseContent | undefined>
}

const initialState: WarehouseSlice = {
  contentIndex: {},
}

export const warehouseSlice = createAppSlice({
  name: "warehouse",
  initialState,
  reducers: {},
  selectors: {
    getWarehouse: (state, cellId: string) => state.contentIndex[cellId],
  },
  extraReducers: builder => {
    builder.addCase(buildingSlice.actions.addBuilding, (state, action) => {
      const { building, cellId } = resolveCellId(action.payload)

      state.contentIndex[cellId] = {
        cellId,
        id: cellId,
        content: {},
        capacity: building.warehouse.capacity,
      }
    })

    builder.addCase(producerSlice.actions.updateProduction, (state, action) => {
      const { cellId } = parseProductionKey(action.payload.producerId)
      const { resource, amount } = action.payload
      const warehouse = state.contentIndex[cellId]
      if (!warehouse) return

      if (
        [
          GeneratedResourceName.ENERGY,
          GeneratedResourceName.POPULATION,
        ].includes(resource)
      ) {
        return // can't store energy
      }

      const availableForResource = getAvailableSpaceForResource(
        warehouse,
        resource,
      )

      const toStore = Math.min(availableForResource, amount)
      if (toStore <= 0) return

      warehouse.content[resource] = (warehouse.content[resource] ?? 0) + toStore
    })
  },
})

export const { getWarehouse } = warehouseSlice.selectors
export const getWarehouseContent = createSelector(
  (state: RootState) => state.warehouse.contentIndex,
  contentIndex => Object.values(contentIndex),
)
