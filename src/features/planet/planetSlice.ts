import { createSelector, type PayloadAction } from "@reduxjs/toolkit"
import { createAppSlice } from "../../app/createAppSlice"
import { type Planet } from "./types"
import { type CellCoord } from "../cell/types"
import { type RootState } from "@/app/store"

type PlanetState = {
  lastId: number
  planetIndex: Record<number, Planet>
  currentPlanetId: number
  focusedCell: CellCoord
}

const firstPlanet: Planet = {
  id: 1,
  name: "Earth",
}

const initialState: PlanetState = {
  lastId: 1,
  planetIndex: {
    [firstPlanet.id]: firstPlanet,
  },
  currentPlanetId: firstPlanet.id,
  focusedCell: { q: 0, r: 0 },
}

export const planetSlice = createAppSlice({
  name: "planet",
  initialState,
  reducers: {
    addPlanet: (state, action: PayloadAction<string>) => {
      state.lastId++
      state.planetIndex[state.lastId] = {
        id: state.lastId,
        name: action.payload,
      }
    },
    setCurrentPlanetId: (state, action: PayloadAction<number>) => {
      state.currentPlanetId = action.payload
      state.focusedCell = { q: 0, r: 0 }
    },
    setFocusedCell: (state, action: PayloadAction<CellCoord>) => {
      state.focusedCell = action.payload
    },
  },
  selectors: {
    getPlanetById: (state, id: number) => state.planetIndex[id],
    getCurrentPlanetId: state => state.currentPlanetId,
    getFocusedCellCoord: state => state.focusedCell,
  },
})

export const getPlanets = createSelector(
  (state: RootState) => state.planet.planetIndex,
  planetIndex => Object.values(planetIndex),
)

export const { addPlanet, setFocusedCell, setCurrentPlanetId } =
  planetSlice.actions
export const { getPlanetById, getCurrentPlanetId, getFocusedCellCoord } =
  planetSlice.selectors
