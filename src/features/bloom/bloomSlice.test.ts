/*
 * bloomSlice tests
 *
 * Behavior-level tests for the per-cell infestation state and the actions
 * that mutate it. The simulator's growth/spread logic is tested separately
 * in simulator.test.ts; these tests pin down the slice's contract with the
 * rest of the app (seeding for the infection event and dev tools, applying
 * a tick's updates atomically, per-planet active/dormant flags).
 */
import { describe, it, expect } from "vitest"
import {
  bloomSlice,
  bloomTickApplied,
  infestationSeeded,
  planetActivated,
  selectIsPlanetActive,
} from "./bloomSlice"
import { type RootState } from "@/app/store"

const STARTING_PLANET_ID = 1

/** Wraps a slice-state into the shape selectors expect. */
const rootStateFromBloom = (
  bloomState: ReturnType<typeof bloomSlice.reducer>,
): RootState => ({ bloom: bloomState }) as unknown as RootState

describe("infestationSeeded", () => {
  it("sets the infestation of a single cell", () => {
    const state = bloomSlice.reducer(
      undefined,
      infestationSeeded({ cellId: "1:0:0", amount: 5 }),
    )

    expect(state.infestation["1:0:0"]).toBe(5)
  })
})

describe("planetActivated", () => {
  it("activates a previously-dormant planet, leaving others untouched", () => {
    const initial = bloomSlice.reducer(undefined, { type: "@@INIT" })
    expect(
      selectIsPlanetActive(rootStateFromBloom(initial), STARTING_PLANET_ID),
    ).toBe(true)
    expect(selectIsPlanetActive(rootStateFromBloom(initial), 2)).toBe(false)

    const next = bloomSlice.reducer(initial, planetActivated({ planetId: 2 }))

    expect(selectIsPlanetActive(rootStateFromBloom(next), 2)).toBe(true)
    expect(
      selectIsPlanetActive(rootStateFromBloom(next), STARTING_PLANET_ID),
    ).toBe(true)
  })
})

describe("bloomTickApplied", () => {
  it("applies multiple cell updates atomically", () => {
    const initial = bloomSlice.reducer(
      undefined,
      infestationSeeded({ cellId: "1:0:0", amount: 1 }),
    )

    const next = bloomSlice.reducer(
      initial,
      bloomTickApplied({
        updates: { "1:0:0": 4, "1:1:0": 2 },
      }),
    )

    expect(next.infestation["1:0:0"]).toBe(4)
    expect(next.infestation["1:1:0"]).toBe(2)
  })
})
