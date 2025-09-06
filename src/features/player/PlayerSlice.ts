import type { PayloadAction } from "@reduxjs/toolkit"
import { createAppSlice } from "../../app/createAppSlice"

type PlayerState = {
  name: string
  score: number
}

const initialState: PlayerState = {
  name: "James Holden",
  score: 0,
}

export const playerSlice = createAppSlice({
  name: "player",
  initialState,
  reducers: {
    updatePlayerScore: (state, action: PayloadAction<number>) => {
      state.score += action.payload
    },
    updatePlayerName: (state, action: PayloadAction<string>) => {
      state.name = action.payload
    },
  },
  // You can define your selectors here. These selectors receive the slice
  // state as their first argument.
  selectors: {
    selectPlayerName: player => player.name,
    selectPlayerScore: player => player.score,
  },
})

export const { updatePlayerScore, updatePlayerName } = playerSlice.actions
export const { selectPlayerName, selectPlayerScore } = playerSlice.selectors
