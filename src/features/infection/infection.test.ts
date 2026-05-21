/*
 * infection module tests
 *
 * Behavior-level tests for the pure infection module:
 *   - shouldTriggerInfection: both floors required, one-shot per game.
 *   - selectPatientZero: biomass-weighted with uniform fallback,
 *     deterministic under a fixed RNG.
 *
 * The module knows nothing about Redux, time, or the DOM — it takes
 * plain inputs and returns a plain decision. The InfectionTicker wires
 * it to live store state.
 */
import { describe, it, expect } from "vitest"
import {
  shouldTriggerInfection,
  selectPatientZero,
  evaluateInfectionTick,
  type BuildingCandidate,
} from "./infection"
import {
  INFECTION_BUILDING_FLOOR,
  INFECTION_DEVELOPED_CELL_FLOOR,
  INFECTION_INITIAL_INFESTATION_RATIO,
  INFECTION_TIME_FLOOR_MS,
} from "@/config"

describe("shouldTriggerInfection", () => {
  it("returns true when both floors are met and not yet fired", () => {
    const fire = shouldTriggerInfection({
      elapsedMs: INFECTION_TIME_FLOOR_MS,
      developedCellCount: INFECTION_DEVELOPED_CELL_FLOOR,
      buildingCount: INFECTION_BUILDING_FLOOR,
      hasFired: false,
    })

    expect(fire).toBe(true)
  })

  it("returns false when elapsed time is below the floor", () => {
    const fire = shouldTriggerInfection({
      elapsedMs: INFECTION_TIME_FLOOR_MS - 1,
      developedCellCount: INFECTION_DEVELOPED_CELL_FLOOR,
      buildingCount: INFECTION_BUILDING_FLOOR,
      hasFired: false,
    })

    expect(fire).toBe(false)
  })

  it("returns false when developed-cell count is below the floor", () => {
    const fire = shouldTriggerInfection({
      elapsedMs: INFECTION_TIME_FLOOR_MS,
      developedCellCount: INFECTION_DEVELOPED_CELL_FLOOR - 1,
      buildingCount: INFECTION_BUILDING_FLOOR,
      hasFired: false,
    })

    expect(fire).toBe(false)
  })

  it("returns false when building count is below the floor", () => {
    const fire = shouldTriggerInfection({
      elapsedMs: INFECTION_TIME_FLOOR_MS,
      developedCellCount: INFECTION_DEVELOPED_CELL_FLOOR,
      buildingCount: INFECTION_BUILDING_FLOOR - 1,
      hasFired: false,
    })

    expect(fire).toBe(false)
  })

  it("returns false once the event has already fired this game", () => {
    const fire = shouldTriggerInfection({
      elapsedMs: INFECTION_TIME_FLOOR_MS * 10,
      developedCellCount: INFECTION_DEVELOPED_CELL_FLOOR * 10,
      buildingCount: INFECTION_BUILDING_FLOOR * 10,
      hasFired: true,
    })

    expect(fire).toBe(false)
  })
})

describe("selectPatientZero", () => {
  it("returns null when there are no candidates", () => {
    const pick = selectPatientZero([], () => 0)
    expect(pick).toBeNull()
  })

  it("picks deterministically from candidates with no biomass (uniform fallback)", () => {
    // Three buildings on biomass-free cells; uniform fallback over them.
    // rng() = 0 must land on the first candidate; rng() ≈ 1 must land
    // on the last. This pins the contract without leaking weighting math.
    const candidates: BuildingCandidate[] = [
      { id: "b1", cellId: "1:0:0", biomassOnCell: 0 },
      { id: "b2", cellId: "1:1:0", biomassOnCell: 0 },
      { id: "b3", cellId: "1:2:0", biomassOnCell: 0 },
    ]

    expect(selectPatientZero(candidates, () => 0)?.id).toBe("b1")
    // 0.99 / 3 = 0.33 → floor → 0; but we want a value that maps to the
    // last bucket. Use a sequence rng.
    let pulls = 0
    const rngLast = () => [0.99][pulls++] ?? 0
    expect(selectPatientZero(candidates, rngLast)?.id).toBe("b3")
  })

  it("favors biomass-rich cells across many trials", () => {
    // One biomass-rich building (weight 10) vs nine biomass-free buildings
    // (weight 1 each). With uniform selection the biomass building would
    // be picked ~10% of the time; with biomass weighting it must dominate.
    // Use Math.random for the trial — the *aggregate* skew is what we
    // care about, not exact reproducibility.
    const candidates: BuildingCandidate[] = [
      { id: "biomass", cellId: "1:0:0", biomassOnCell: 10 },
      ...Array.from({ length: 9 }, (_, i) => ({
        id: `bare-${i.toString()}`,
        cellId: `1:${(i + 1).toString()}:0`,
        biomassOnCell: 0,
      })),
    ]

    const trials = 1_000
    let biomassPicks = 0
    for (let i = 0; i < trials; i++) {
      if (selectPatientZero(candidates, Math.random)?.id === "biomass") {
        biomassPicks += 1
      }
    }
    // Far above the 10% the uniform baseline would yield. Pin a generous
    // floor that survives RNG variance — the weighting is the point, not
    // the exact ratio.
    expect(biomassPicks).toBeGreaterThan(trials * 0.4)
  })

  it("is deterministic given a fixed RNG when biomass weighting applies", () => {
    const candidates: BuildingCandidate[] = [
      { id: "biomass", cellId: "1:0:0", biomassOnCell: 10 },
      { id: "bare", cellId: "1:1:0", biomassOnCell: 0 },
    ]

    // Same RNG → same pick. Pins the determinism contract the brief calls
    // out: "deterministic given fixed RNG".
    const a = selectPatientZero(candidates, () => 0.5)?.id
    const b = selectPatientZero(candidates, () => 0.5)?.id
    expect(a).toBe(b)
  })
})

describe("evaluateInfectionTick", () => {
  it("returns null when the floors are not met", () => {
    const decision = evaluateInfectionTick(
      {
        elapsedMs: 0,
        hasFired: false,
        developedCellCount: 0,
        candidates: [],
      },
      () => 0,
    )

    expect(decision).toBeNull()
  })

  it("returns a fire decision when triggers met, with infestation set to the configured ratio of the cell's cap", () => {
    const decision = evaluateInfectionTick(
      {
        elapsedMs: INFECTION_TIME_FLOOR_MS,
        hasFired: false,
        developedCellCount: INFECTION_DEVELOPED_CELL_FLOOR,
        candidates: Array.from(
          { length: INFECTION_BUILDING_FLOOR },
          (_, i) => ({
            id: `b${i.toString()}`,
            cellId: `1:${i.toString()}:0`,
            biomassOnCell: 0,
            cellCap: 10,
          }),
        ),
      },
      () => 0, // first candidate
    )

    if (decision === null) throw new Error("expected a fire decision")
    expect(decision.buildingId).toBe("b0")
    expect(decision.cellId).toBe("1:0:0")
    expect(decision.infestation).toBeCloseTo(
      10 * INFECTION_INITIAL_INFESTATION_RATIO,
    )
  })

  it("returns null when there are no candidate buildings, even if other floors are met", () => {
    const decision = evaluateInfectionTick(
      {
        elapsedMs: INFECTION_TIME_FLOOR_MS,
        hasFired: false,
        developedCellCount: INFECTION_DEVELOPED_CELL_FLOOR,
        candidates: [],
      },
      () => 0,
    )

    expect(decision).toBeNull()
  })
})
