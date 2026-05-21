/*
 * bloomSlice
 *
 * Owns per-cell Bloom state for every planet in the system: the current
 * infestation level keyed by cellId, and a per-planet active/dormant flag
 * that controls whether the simulator ticks that planet. Cells absent from
 * `infestation` have no Bloom (treated as 0); cells absent from
 * `activePlanets` default to dormant.
 *
 * The growth and spread *logic* lives in `bloom/simulator.ts` as a pure
 * function. This slice owns the state and exposes the actions that mutate
 * it: `infestationSeeded` (used by the infection event in #7 and by dev
 * tools), `bloomTickApplied` (atomic application of one tick's updates),
 * and planet activation.
 *
 * Public API: infestationSeeded, bloomTickApplied, planetActivated
 */
import { createAppSlice } from "@/app/createAppSlice"
import { type PayloadAction } from "@reduxjs/toolkit"
import { type RootState } from "@/app/store"

interface BloomState {
  /** Per-cell infestation level. Cells absent from this map are clean. */
  infestation: Record<string, number>
  /** Planet ids that the simulator is allowed to tick. Absent = dormant. */
  activePlanets: Record<number, boolean>
}

const initialState: BloomState = {
  infestation: {},
  // Starting planet is active by default; others stay dormant until a
  // Colony Ship lands (slice #10).
  activePlanets: { 1: true },
}

export const bloomSlice = createAppSlice({
  name: "bloom",
  initialState,
  reducers: {
    infestationSeeded: (
      state,
      action: PayloadAction<{ cellId: string; amount: number }>,
    ) => {
      state.infestation[action.payload.cellId] = action.payload.amount
    },
    bloomTickApplied: (
      state,
      action: PayloadAction<{ updates: Record<string, number> }>,
    ) => {
      for (const [cellId, value] of Object.entries(action.payload.updates)) {
        state.infestation[cellId] = value
      }
    },
    planetActivated: (
      state,
      action: PayloadAction<{ planetId: number }>,
    ) => {
      state.activePlanets[action.payload.planetId] = true
    },
  },
})

export const { bloomTickApplied, infestationSeeded, planetActivated } =
  bloomSlice.actions

export const selectIsPlanetActive = (
  state: RootState,
  planetId: number,
): boolean => state.bloom.activePlanets[planetId] === true

export const selectInfestation = (
  state: RootState,
  cellId: string,
): number => state.bloom.infestation[cellId] ?? 0
