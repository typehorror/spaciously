/*
 * infectionSlice tests
 *
 * Behavior-level tests for the one-shot infection event record. The slice
 * owns just enough state to make the event one-shot per game and to
 * surface the host building to the patient-zero marker.
 */
import { describe, it, expect } from "vitest"
import {
  infectionSlice,
  infectionFired,
  selectHasFired,
  selectPatientZeroBuildingId,
} from "./infectionSlice"
import { type RootState } from "@/app/store"

const rootStateFromInfection = (
  infection: ReturnType<typeof infectionSlice.reducer>,
): RootState => ({ infection }) as unknown as RootState

describe("infectionFired", () => {
  it("records that the event has fired and stores the host building id", () => {
    const next = infectionSlice.reducer(
      undefined,
      infectionFired({ cellId: "1:0:0", buildingId: "1:0:0:0" }),
    )

    expect(selectHasFired(rootStateFromInfection(next))).toBe(true)
    expect(selectPatientZeroBuildingId(rootStateFromInfection(next))).toBe(
      "1:0:0:0",
    )
  })

  it("is one-shot: re-dispatching does not overwrite the original host", () => {
    const first = infectionSlice.reducer(
      undefined,
      infectionFired({ cellId: "1:0:0", buildingId: "1:0:0:0" }),
    )
    const second = infectionSlice.reducer(
      first,
      infectionFired({ cellId: "1:9:9", buildingId: "1:9:9:3" }),
    )

    expect(selectPatientZeroBuildingId(rootStateFromInfection(second))).toBe(
      "1:0:0:0",
    )
  })
})
