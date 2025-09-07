import { createAppSlice } from "@/app/createAppSlice"
import type { Warehouse, WarehouseContent } from "./types"
import { buildingSlice } from "../building/buildingSlice"
import { parseCellId, resolveCellId } from "../cell/utils"
import { createDraftSafeSelector, createEntityAdapter } from "@reduxjs/toolkit"
import { producerSlice } from "../production/producerSlice"
import { parseProductionKey } from "../production/utils"
import { getAvailableSpaceForResource } from "./utils"
import { GeneratedResourceName } from "../resources/types"
import { type RootState } from "@/app/store"

const warehousesAdapter = createEntityAdapter({
  selectId: (warehouse: Warehouse) => warehouse.cellId,
  sortComparer: (a, b) => a.cellId.localeCompare(b.cellId),
})

export const warehouseSlice = createAppSlice({
  name: "warehouse",
  initialState: warehousesAdapter.getInitialState(),
  reducers: {},
  selectors: {
    getWarehouse: (state, cellId: string) =>
      warehousesAdapter.getSelectors().selectById(state, cellId),
  },
  extraReducers: builder => {
    builder.addCase(buildingSlice.actions.addBuilding, (state, action) => {
      const { building, cellId } = resolveCellId(action.payload)

      warehousesAdapter.upsertOne(state, {
        cellId,
        content: {},
        capacity: building.warehouse.capacity,
      })
    })

    builder.addCase(producerSlice.actions.updateProduction, (state, action) => {
      const { cellId } = parseProductionKey(action.payload.producerId)
      const { resource, amount } = action.payload
      const warehouse = warehousesAdapter
        .getSelectors()
        .selectById(state, cellId)

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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

      warehousesAdapter.updateOne(state, {
        id: cellId,
        changes: {
          content: {
            ...warehouse.content,
            [resource]: (warehouse.content[resource] ?? 0) + toStore,
          },
        },
      })
    })
  },
})

export const { getWarehouse } = warehouseSlice.selectors

export const { selectAll: getWarehouses } = warehousesAdapter.getSelectors(
  (state: RootState) => state.warehouse,
)

export const getPlanetWarehousesContent = createDraftSafeSelector(
  [
    (state: RootState) =>
      warehousesAdapter.getSelectors().selectAll(state.warehouse),
    (_, planetId: number) => planetId,
  ],
  (warehouses, planetId): WarehouseContent => {
    console.log("Calculating warehouse content for planet", planetId)
    return warehouses
      .filter(w => parseCellId(w.cellId).planetId === planetId)
      .reduce((acc: WarehouseContent, w) => {
        for (const resourceName in w.content) {
          acc[resourceName] =
            (acc[resourceName] ?? 0) + (w.content[resourceName] ?? 0)
        }
        return acc
      }, {})
  },
)
