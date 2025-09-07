import { createAppSlice } from "@/app/createAppSlice"
import type { Production } from "./types"
import { type CellRef, parseCellId, resolveCellId } from "../cell/utils"
import { createEntityAdapter, type PayloadAction } from "@reduxjs/toolkit"
import { generateProductionKey } from "./utils"
import { gameSlice } from "../game/gameSlice"
import { type AllResourceNames } from "../resources/types"

export const producerAdapter = createEntityAdapter({
  selectId: (production: Production) => production.id,
  sortComparer: (a, b) => a.id.localeCompare(b.id),
})

export const producerSlice = createAppSlice({
  name: "producerState",
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
    updateProduction: (
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
  selectors: {
    getProducer: (
      state,
      cellRef: CellRef & { name: string },
    ): Production | undefined => {
      const { cellId, name } = resolveCellId(cellRef)
      const key = generateProductionKey(cellId, name)
      return producerAdapter.getSelectors().selectById(state, key)
    },
    getProducerIndex: state =>
      producerAdapter.getSelectors().selectEntities(state),
    getProducers: state => producerAdapter.getSelectors().selectAll(state),
    getPlanetProducers: (state, planetId: number) =>
      producerAdapter
        .getSelectors()
        .selectAll(state)
        .filter(p => planetId === parseCellId(p.cellId).planetId),
    getEnergyUsage: state =>
      producerAdapter
        .getSelectors()
        .selectAll(state)
        .reduce((acc, p) => acc + p.energyUsage, 0),
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

export const { getProducer, getProducerIndex, getProducers } =
  producerSlice.selectors
export const { toggleProduction, updateProduction } = producerSlice.actions
