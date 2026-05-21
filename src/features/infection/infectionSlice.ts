/*
 * infectionSlice
 *
 * Records the one-shot infection event on the starting planet (ADR-0002
 * §9, CONTEXT.md "Infection"). State is minimal:
 *
 *   - hasFired: has the event ever fired this game?
 *   - patientZero: the cell + host building chosen at fire time, kept
 *     around so the UI can paint a "patient zero" marker on the host
 *     building.
 *
 * The growth/spread logic that follows is the standard simulator's job
 * (bloomSlice + bloom/simulator). This slice does not own infestation —
 * it only owns the *event*. The companion `infestationSeeded` dispatch
 * (in InfectionTicker) is what jumps the host cell's infestation.
 *
 * One-shot: once hasFired is true, infectionFired re-dispatches are
 * ignored. The InfectionTicker also gates on this flag, but the slice
 * enforces it defensively so dev tools / replays cannot drop the game
 * back into "uninfected".
 *
 * Public API: infectionFired, selectHasFired, selectPatientZeroBuildingId,
 * selectPatientZeroCellId
 */
import { createAppSlice } from "@/app/createAppSlice"
import { type PayloadAction } from "@reduxjs/toolkit"
import { type RootState } from "@/app/store"

interface PatientZero {
  cellId: string
  buildingId: string
}

interface InfectionState {
  hasFired: boolean
  patientZero: PatientZero | null
}

const initialState: InfectionState = {
  hasFired: false,
  patientZero: null,
}

export const infectionSlice = createAppSlice({
  name: "infection",
  initialState,
  reducers: {
    infectionFired: (state, action: PayloadAction<PatientZero>) => {
      if (state.hasFired) return
      state.hasFired = true
      state.patientZero = action.payload
    },
  },
})

export const { infectionFired } = infectionSlice.actions

export const selectHasFired = (state: RootState): boolean =>
  state.infection.hasFired

export const selectPatientZeroBuildingId = (
  state: RootState,
): string | null => state.infection.patientZero?.buildingId ?? null

export const selectPatientZeroCellId = (state: RootState): string | null =>
  state.infection.patientZero?.cellId ?? null
