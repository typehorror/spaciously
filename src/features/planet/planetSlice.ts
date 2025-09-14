import { createEntityAdapter, type PayloadAction } from "@reduxjs/toolkit"
import { createAppSlice } from "../../app/createAppSlice"
import { type Planet } from "./types"
import { type CellCoord } from "../cell/types"
import { type RootState } from "@/app/store"

export const planetAdapter = createEntityAdapter<Planet>()

const firstPlanet: Planet = {
  id: 1,
  name: "Earth",
}

export const planetSlice = createAppSlice({
  name: "planet",
  initialState: planetAdapter.getInitialState(
    {
      focusedCell: { q: 0, r: 0 },
      currentPlanetId: 1,
      lastId: 1,
    },
    [firstPlanet],
  ),
  reducers: {
    addPlanet: (state, action: PayloadAction<string>) => {
      state.lastId += 1
      planetAdapter.addOne(state, {
        id: state.lastId,
        name: action.payload,
      })
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
    selectCurrentPlanetId: state => state.currentPlanetId,
    selectFocusedCellCoord: state => state.focusedCell,
  },
})

export const { addPlanet, setFocusedCell, setCurrentPlanetId } =
  planetSlice.actions
export const { selectCurrentPlanetId, selectFocusedCellCoord } =
  planetSlice.selectors

const planetSelectors = planetAdapter.getSelectors<RootState>(s => s.planet)

export const { selectAll: selectAllPlanets, selectById: selectPlanetById } =
  planetSelectors
