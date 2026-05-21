/*
 * infection — pure module for the one-shot infection event.
 *
 * Two responsibilities, both pure:
 *
 *   1. shouldTriggerInfection — decides whether the event should fire
 *      this tick. Requires both floors (elapsed-time AND progress) AND
 *      that the event has not already fired (one-shot per game).
 *
 *   2. selectPatientZero — picks the host building. Weighted toward
 *      buildings whose host cell is biomass-rich; uniform random
 *      fallback when no biomass exists across the candidate set. The
 *      RNG is injected so tests can be deterministic.
 *
 * Both functions take plain values — no Redux, no clock, no DOM. The
 * InfectionTicker (UI layer) reads the live store and wires them in.
 *
 * See ADR-0002 §9 and CONTEXT.md "Infection".
 */
import {
  INFECTION_BUILDING_FLOOR,
  INFECTION_DEVELOPED_CELL_FLOOR,
  INFECTION_INITIAL_INFESTATION_RATIO,
  INFECTION_TIME_FLOOR_MS,
} from "@/config"

export interface InfectionTriggerInput {
  /** Real ms elapsed since the game started (game-clock, not wall-clock). */
  elapsedMs: number
  /** Count of developed cells on the starting planet. */
  developedCellCount: number
  /** Count of player buildings on the starting planet. */
  buildingCount: number
  /** Whether the one-shot event has already fired this game. */
  hasFired: boolean
}

export function shouldTriggerInfection(input: InfectionTriggerInput): boolean {
  if (input.hasFired) return false
  if (input.elapsedMs < INFECTION_TIME_FLOOR_MS) return false
  if (input.developedCellCount < INFECTION_DEVELOPED_CELL_FLOOR) return false
  if (input.buildingCount < INFECTION_BUILDING_FLOOR) return false
  return true
}

export interface BuildingCandidate {
  /** Building id, e.g. "1:0:0:2" (cellId + slotIndex). */
  id: string
  /** Cell id the building sits on. */
  cellId: string
  /** Biomass content on the host cell. 0 means non-biomass cell. */
  biomassOnCell: number
}

// Weight added to every candidate so a biomass-free building is never
// impossible to pick — biomass amplifies the odds, it doesn't gate
// selection. With no biomass anywhere the weights collapse to all 1s,
// recovering uniform random over the full set.
const BASE_WEIGHT = 1
const BIOMASS_WEIGHT_COEFFICIENT = 1

export function selectPatientZero(
  buildings: readonly BuildingCandidate[],
  rng: () => number,
): BuildingCandidate | null {
  if (buildings.length === 0) return null

  const weights = buildings.map(
    b => BASE_WEIGHT + BIOMASS_WEIGHT_COEFFICIENT * Math.max(0, b.biomassOnCell),
  )
  const total = weights.reduce((sum, w) => sum + w, 0)
  let target = rng() * total
  for (let i = 0; i < buildings.length; i++) {
    target -= weights[i] ?? 0
    if (target <= 0) return buildings[i] ?? null
  }
  // Floating-point safety net — fall through to the last candidate if
  // every subtraction left a tiny positive residue.
  return buildings[buildings.length - 1] ?? null
}

export interface InfectionEvaluationInput {
  elapsedMs: number
  hasFired: boolean
  developedCellCount: number
  /** Player-owned buildings on the starting planet, paired with the host
   *  cell's bloom cap so the decision knows how much infestation to seed. */
  candidates: ReadonlyArray<BuildingCandidate & { cellCap: number }>
}

export interface InfectionDecision {
  cellId: string
  buildingId: string
  /** Absolute infestation to seed on the host cell on fire. */
  infestation: number
}

/**
 * Orchestration entry point used by the InfectionTicker. Pure: takes the
 * already-derived state inputs (no Redux) and decides whether/where to
 * fire. The ticker turns this decision into the dispatch sequence
 * (`infestationSeeded` + `infectionFired` + banner).
 */
export function evaluateInfectionTick(
  input: InfectionEvaluationInput,
  rng: () => number,
): InfectionDecision | null {
  const fire = shouldTriggerInfection({
    elapsedMs: input.elapsedMs,
    developedCellCount: input.developedCellCount,
    buildingCount: input.candidates.length,
    hasFired: input.hasFired,
  })
  if (!fire) return null

  const host = selectPatientZero(input.candidates, rng)
  if (!host) return null

  const candidate = input.candidates.find(c => c.id === host.id)
  // selectPatientZero is total over the candidate set; the lookup
  // cannot miss unless the array is mutated mid-call.
  if (!candidate) return null

  return {
    cellId: host.cellId,
    buildingId: host.id,
    infestation: candidate.cellCap * INFECTION_INITIAL_INFESTATION_RATIO,
  }
}
