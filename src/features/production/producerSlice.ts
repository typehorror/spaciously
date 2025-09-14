import { createAppSlice } from "@/app/createAppSlice"
import type { Production } from "./types"
import { parseCellId } from "../cell/utils"
import {
  createEntityAdapter,
  type PayloadAction,
  createDraftSafeSelector,
} from "@reduxjs/toolkit"
import { generateProductionKey } from "./utils"
import { gameSlice } from "../game/gameSlice"
import { type AllResourceNames } from "../resources/types"
import { type RootState } from "@/app/store"

export const producerAdapter = createEntityAdapter({
  selectId: (production: Production) => production.id,
  sortComparer: (a, b) => a.id.localeCompare(b.id),
})

export const producerSlice = createAppSlice({
  name: "producer",
  initialState: producerAdapter.getInitialState(),
  reducers: {
    toggleProduction: (
      state,
      action: PayloadAction<{ production: Production; activate: boolean }>,
    ) => {
      const { production, activate } = action.payload
      const key = generateProductionKey(production.cellId, production.name)

      // we want to turn it off
      if (!activate) {
        producerAdapter.removeOne(state, key)
      } else {
        producerAdapter.upsertOne(state, {
          ...production,
          lastProductionTime: Date.now(),
        })
      }
    },
    produceResource: (
      state,
      action: PayloadAction<{
        producerId: string
        lastProductionTime: number
        amount: number
        resource: AllResourceNames
      }>,
    ) => {
      const { producerId } = action.payload
      producerAdapter.updateOne(state, {
        id: producerId,
        changes: {
          lastProductionTime: new Date().getTime(),
        },
      })
    },
  },
  extraReducers: builder => {
    builder.addCase(gameSlice.actions.resumeGame, (state, action) => {
      const changes: { id: string; changes: Partial<Production> }[] = []

      for (const producer of producerAdapter.getSelectors().selectAll(state)) {
        changes.push({
          id: producer.id,
          changes: {
            lastProductionTime:
              producer.lastProductionTime + action.payload.offset,
          },
        })
      }

      producerAdapter.updateMany(state, changes)
    })
  },
})

export const { toggleProduction, produceResource } = producerSlice.actions

const producerSelectors = producerAdapter.getSelectors<RootState>(
  s => s.producer,
)

export const {
  selectAll: selectAllProducers,
  selectById: selectProducerById,
  selectEntities: selectProducerEntities,
} = producerSelectors

export const selectPlanetEnergyUsage = createDraftSafeSelector(
  [
    (state: RootState) => producerSelectors.selectAll(state),
    (_, planetId: number) => planetId,
  ],
  (producers, planetId) =>
    producers.reduce((acc, p) => {
      if (planetId === parseCellId(p.cellId).planetId) {
        return acc + p.energyUsage
      }
      return acc
    }, 0),
)

export const selectPlanetProducers = createDraftSafeSelector(
  [
    (state: RootState) => producerSelectors.selectAll(state),
    (_, planetId: number) => planetId,
  ],
  (producers, planetId) =>
    producers.filter(p => planetId === parseCellId(p.cellId).planetId),
)
