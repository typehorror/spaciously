import { createAppSlice } from "@/app/createAppSlice"
import type { ActiveProduction, Production } from "./types"
import { type CellRef, resolveCellId } from "../cell/utils"
import { createSelector, type PayloadAction } from "@reduxjs/toolkit"
import { generateProductionKey } from "./utils"
import { gameSlice } from "../game/gameSlice"
import { type RootState } from "@/app/store"
import { type AllResourceNames } from "../resources/types"

type ProducerSliceState = {
  producers: Record<string, ActiveProduction>
}

const initialState: ProducerSliceState = {
  producers: {},
}

export const producerSlice = createAppSlice({
  name: "producerState",
  initialState,
  reducers: {
    toggleProduction: (state, action: PayloadAction<Production>) => {
      const production = action.payload
      const key = generateProductionKey(production.cellId, production.name)

      if (key in state.producers) {
        // can't use Maps with redux toolkit
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete state.producers[key]
      } else {
        state.producers[key] = {
          id: production.id,
          lastProductionTime: new Date().getTime(),
        }
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
      state.producers[producerId].lastProductionTime = new Date().getTime()
    },
  },
  selectors: {
    getProducer: (
      state,
      cellRef: CellRef & { name: string },
    ): ActiveProduction | undefined => {
      const { cellId, name } = resolveCellId(cellRef)
      const key = generateProductionKey(cellId, name)
      return state.producers[key]
    },
    getProducerIndex: state => state.producers,
    // getProducers: state => Object.values(state.producers),
  },
  extraReducers: builder => {
    builder.addCase(gameSlice.actions.resumeGame, (state, action) => {
      for (const producerId in state.producers) {
        state.producers[producerId].lastProductionTime += action.payload.offset
      }
    })
  },
})

export const getProducers = createSelector(
  (state: RootState) => state.producerState.producers,
  producers => Object.values(producers),
)

export const { getProducer, getProducerIndex } = producerSlice.selectors
export const { toggleProduction, updateProduction } = producerSlice.actions
