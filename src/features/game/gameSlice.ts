import { type PayloadAction } from "@reduxjs/toolkit"
import { createAppSlice } from "../../app/createAppSlice"

type GameState = {
  status: "idle" | "playing" | "paused" | "stopped"
  startTime: number
  pauseTime: number
}

const initialState: GameState = {
  status: "idle",
  startTime: 0,
  pauseTime: 0,
}

export const gameSlice = createAppSlice({
  name: "game",
  initialState,
  reducers: {
    startGame: state => {
      state.status = "playing"
      state.startTime = Date.now()
      state.pauseTime = Date.now()
    },
    resumeGame: (state, action: PayloadAction<{ offset: number }>) => {
      state.status = "playing"
      state.startTime = Date.now()
      console.log(`Game resumed, offset: ${action.payload.offset.toString()}ms`)
    },
    pauseGame: (state, action: PayloadAction<number>) => {
      state.status = "paused"
      state.pauseTime = action.payload
    },
  },
  // You can define your selectors here. These selectors receive the slice
  // state as their first argument.
  selectors: {
    selectGameStatus: game => game.status,
    selectGameStartTime: game => game.startTime,
    selectGamePauseTime: game => game.pauseTime,
  },
})

export const { startGame, pauseGame, resumeGame } = gameSlice.actions
export const { selectGameStatus, selectGameStartTime, selectGamePauseTime } =
  gameSlice.selectors
