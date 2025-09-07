import { createAppSlice } from "@/app/createAppSlice"
import type { Habitat } from "./types"
import { buildingSlice } from "../building/buildingSlice"
import { parseCellId, resolveCellId } from "../cell/utils"
import { createDraftSafeSelector, createEntityAdapter } from "@reduxjs/toolkit"
import { producerSlice } from "../production/producerSlice"
import { parseProductionKey } from "../production/utils"
import { GeneratedResourceName } from "../resources/types"
import { type RootState } from "@/app/store"

const habitatsAdapter = createEntityAdapter({
  selectId: (habitat: Habitat) => habitat.cellId,
  sortComparer: (a, b) => a.cellId.localeCompare(b.cellId),
})

export const habitatSlice = createAppSlice({
  name: "habitat",
  initialState: habitatsAdapter.getInitialState(),
  reducers: {},
  selectors: {
    getHabitat: (state, cellId: string) =>
      habitatsAdapter.getSelectors().selectById(state, cellId),
  },
  extraReducers: builder => {
    builder.addCase(buildingSlice.actions.addBuilding, (state, action) => {
      const { building, cellId } = resolveCellId(action.payload)

      habitatsAdapter.upsertOne(state, {
        cellId,
        population: 0,
        capacity: building.habitat.capacity,
      })
    })

    builder.addCase(producerSlice.actions.updateProduction, (state, action) => {
      const { cellId } = parseProductionKey(action.payload.producerId)
      const { resource, amount } = action.payload

      const habitat = habitatsAdapter.getSelectors().selectById(state, cellId)

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!habitat) return

      if (resource !== GeneratedResourceName.POPULATION) {
        return // only interested in population here
      }

      const toStore = Math.min(habitat.capacity - habitat.population, amount)
      if (toStore <= 0) return

      habitatsAdapter.updateOne(state, {
        id: cellId,
        changes: {
          population: habitat.population + toStore,
        },
      })
    })
  },
})

export const { getHabitat } = habitatSlice.selectors

export const { selectAll: getHabitats } = habitatsAdapter.getSelectors(
  (state: RootState) => state.habitat,
)

export const getPlanetPopulation = createDraftSafeSelector(
  [
    (state: RootState) =>
      habitatsAdapter.getSelectors().selectAll(state.habitat),
    (_, planetId: number) => planetId,
  ],
  (habitats, planetId): number => {
    return habitats
      .filter(w => parseCellId(w.cellId).planetId === planetId)
      .reduce((acc: number, w) => {
        acc += w.population
        return acc
      }, 0)
  },
)
