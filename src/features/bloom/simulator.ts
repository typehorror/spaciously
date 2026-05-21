/*
 * bloom/simulator — one tick of the Bloom's growth and spread.
 *
 * Pure module. Given a snapshot of cells (resources, knowledge state,
 * current infestation), a neighbor function, and an optional RNG, returns
 * the cellIds whose infestation changed and their new values. Cells absent
 * from the returned map are unchanged this tick.
 *
 * The simulator embodies the two-step model from ADR-0002 §3:
 *
 *   1. Grow — every cell with infestation > 0 increases by its per-cell
 *      growthRate, capped at its per-cell cap. Both are derived from the
 *      cell's resource composition.
 *   2. Spread (at cap only) — a cell sitting at cap deposits seedQuantity
 *      into each adjacent non-developed cell. The Bloom does not enter
 *      developed cells via spread; siege and breach handle that path.
 *
 * One probabilistic exception: gas-rich cells at cap may airborne-seed a
 * non-adjacent hidden cell on the same planet, weighted by their Gas
 * content. The RNG is injected so tests can be deterministic.
 *
 * Per-resource rate resolution stays internal — the public interface stays
 * simpleTick. If rates need to be previewed by the UI later, extract.
 */
import { ResourceName } from "../resources/types"
import { HexCellState } from "../cell/types"
import {
  BASE_CAP,
  BASE_GROWTH_RATE,
  BASE_SEED_QUANTITY,
  BLOOM_RESOURCE_CAP_PER_UNIT,
  BLOOM_RESOURCE_GROWTH_PER_UNIT,
  GAS_AIRBORNE_PROBABILITY,
} from "@/config"

export interface BloomCellInput {
  id: string
  resources: Record<ResourceName, number>
  state: HexCellState
  infestation: number
}

export interface SimulateTickInput {
  cells: readonly BloomCellInput[]
  getNeighbors: (cellId: string) => readonly string[]
  rng?: () => number
}

interface BloomRates {
  growthRate: number
  cap: number
}

export function simulateTick(input: SimulateTickInput): Map<string, number> {
  const updates = new Map<string, number>()
  const byId = new Map<string, BloomCellInput>()
  for (const cell of input.cells) byId.set(cell.id, cell)
  const rng = input.rng ?? Math.random

  // Pass 1: grow occupied cells up to their cap.
  for (const cell of input.cells) {
    if (cell.infestation <= 0) continue
    const { growthRate, cap } = resolveRates(cell.resources)
    if (cell.infestation >= cap) continue
    const grown = Math.min(cell.infestation + growthRate, cap)
    if (grown !== cell.infestation) {
      updates.set(cell.id, grown)
    }
  }

  // Pass 2: spread from cells already at cap into adjacent non-developed
  // cells. The Bloom does not enter developed cells via spread — siege and
  // breach are the only paths in.
  for (const source of input.cells) {
    const { cap } = resolveRates(source.resources)
    if (source.infestation < cap) continue
    for (const neighborId of input.getNeighbors(source.id)) {
      const target = byId.get(neighborId)
      if (!target) continue
      if (target.state === HexCellState.DEVELOPED) continue
      const targetRates = resolveRates(target.resources)
      const current = updates.get(target.id) ?? target.infestation
      const next = Math.min(current + BASE_SEED_QUANTITY, targetRates.cap)
      if (next !== target.infestation) {
        updates.set(target.id, next)
      }
    }
  }

  // Pass 3: gas airborne seeding — the sole probabilistic element. Each
  // gas-rich cell at cap rolls against a probability weighted by its Gas
  // content; on hit, it seeds a single non-adjacent hidden cell on the same
  // planet. See ADR-0002 §3.
  for (const source of input.cells) {
    const gasContent = source.resources[ResourceName.GAS]
    if (gasContent <= 0) continue
    const { cap } = resolveRates(source.resources)
    if (source.infestation < cap) continue

    const probability = Math.min(1, GAS_AIRBORNE_PROBABILITY * gasContent)
    if (rng() >= probability) continue

    const neighborIds = new Set(input.getNeighbors(source.id))
    const candidates = input.cells.filter(
      candidate =>
        candidate.id !== source.id &&
        !neighborIds.has(candidate.id) &&
        candidate.state === HexCellState.HIDDEN,
    )
    if (candidates.length === 0) continue
    const pickIndex = Math.floor(rng() * candidates.length)
    const pick = candidates[pickIndex]
    if (!pick) continue
    const pickRates = resolveRates(pick.resources)
    const current = updates.get(pick.id) ?? pick.infestation
    const next = Math.min(current + BASE_SEED_QUANTITY, pickRates.cap)
    if (next !== pick.infestation) {
      updates.set(pick.id, next)
    }
  }

  return updates
}

/**
 * Resolve per-cell Bloom rates from the cell's resource composition. The
 * direction of each resource's effect is committed in ADR-0002 §3; the
 * specific coefficients live in `config.ts` and tune during playtest.
 */
function resolveRates(resources: Record<ResourceName, number>): BloomRates {
  let growthMultiplier = 1
  let capMultiplier = 1

  for (const resource of Object.values(ResourceName)) {
    const amount = resources[resource]
    growthMultiplier += BLOOM_RESOURCE_GROWTH_PER_UNIT[resource] * amount
    capMultiplier += BLOOM_RESOURCE_CAP_PER_UNIT[resource] * amount
  }

  return {
    growthRate: Math.max(0, BASE_GROWTH_RATE * growthMultiplier),
    cap: Math.max(1, BASE_CAP * capMultiplier),
  }
}
