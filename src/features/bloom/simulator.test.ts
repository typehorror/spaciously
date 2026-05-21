/*
 * bloom/simulator module tests
 *
 * Behavior-level tests for the pure Bloom simulator. Tests describe what
 * one tick of the simulator does — growth, spread at cap, refusal to spread
 * into developed cells, gas airborne seeding — not how it does it. The
 * neighbor function and RNG are injected so the module has no coupling to
 * hex math or non-determinism.
 *
 * Test fixtures (graphNeighbors, cell builders) live at the bottom to keep
 * cases readable.
 */
import { describe, it, expect } from "vitest"
import { simulateTick, type BloomCellInput } from "./simulator"
import { HexCellState, ResourceName } from "../cell/types"
import { BASE_CAP } from "@/config"

describe("simulateTick", () => {
  it("returns no updates when there are no cells", () => {
    const updates = simulateTick({
      cells: [],
      getNeighbors: () => [],
    })

    expect(updates.size).toBe(0)
  })

  it("grows an infested cell that is below cap", () => {
    const cell = cellOf({
      id: "A",
      infestation: 1,
      resources: { [ResourceName.ORE]: 10 },
    })

    const updates = simulateTick({
      cells: [cell],
      getNeighbors: () => [],
    })

    const next = updates.get("A")
    if (next === undefined) throw new Error("expected an update for A")
    expect(next).toBeGreaterThan(1)
  })

  it("does not grow a cell already at cap", () => {
    // Ore is neutral (growth multiplier = 0 per unit), so an Ore-only cell's
    // cap equals BASE_CAP. Seeding at BASE_CAP puts the cell exactly at its
    // ceiling.
    const cell = cellOf({
      id: "A",
      infestation: BASE_CAP,
      resources: { [ResourceName.ORE]: 10 },
    })

    const updates = simulateTick({
      cells: [cell],
      getNeighbors: () => [],
    })

    expect(updates.has("A")).toBe(false)
  })

  it("does not spread from a cell below cap", () => {
    const source = cellOf({
      id: "A",
      infestation: 1, // well below cap
      resources: { [ResourceName.ORE]: 10 },
    })
    const target = cellOf({
      id: "B",
      infestation: 0,
      state: HexCellState.HIDDEN,
      resources: { [ResourceName.ORE]: 10 },
    })

    const updates = simulateTick({
      cells: [source, target],
      getNeighbors: graphNeighbors({ A: ["B"], B: ["A"] }),
    })

    expect(updates.has("B")).toBe(false)
  })

  it("airborne-seeds a non-adjacent hidden cell from a gas-rich cell at cap", () => {
    const source = cellOf({
      id: "A",
      infestation: BASE_CAP,
      resources: { [ResourceName.GAS]: 10 },
    })
    const adjacent = cellOf({
      id: "B",
      infestation: 0,
      state: HexCellState.HIDDEN,
      resources: { [ResourceName.ORE]: 10 },
    })
    const remote = cellOf({
      id: "C",
      infestation: 0,
      state: HexCellState.HIDDEN,
      resources: { [ResourceName.ORE]: 10 },
    })

    // RNG that always triggers and always picks the first eligible target.
    const rng = () => 0

    const updates = simulateTick({
      cells: [source, adjacent, remote],
      getNeighbors: graphNeighbors({ A: ["B"], B: ["A"], C: [] }),
      rng,
    })

    const remoteNext = updates.get("C")
    if (remoteNext === undefined) throw new Error("expected an update for C")
    expect(remoteNext).toBeGreaterThan(0)
  })

  it("grows a biomass-rich cell faster than an ore-only cell", () => {
    const biomassCell = cellOf({
      id: "biomass",
      infestation: 1,
      resources: { [ResourceName.BIOMASS]: 10 },
    })
    const oreCell = cellOf({
      id: "ore",
      infestation: 1,
      resources: { [ResourceName.ORE]: 10 },
    })

    const updates = simulateTick({
      cells: [biomassCell, oreCell],
      getNeighbors: () => [],
    })

    const biomassNext = updates.get("biomass")
    const oreNext = updates.get("ore")
    if (biomassNext === undefined) {
      throw new Error("expected an update for biomass")
    }
    if (oreNext === undefined) throw new Error("expected an update for ore")
    expect(biomassNext).toBeGreaterThan(oreNext)
  })

  it("does not spread into adjacent developed cells", () => {
    const source = cellOf({
      id: "A",
      infestation: BASE_CAP,
      resources: { [ResourceName.ORE]: 10 },
    })
    const developedNeighbor = cellOf({
      id: "B",
      infestation: 0,
      state: HexCellState.DEVELOPED,
      resources: { [ResourceName.ORE]: 10 },
    })

    const updates = simulateTick({
      cells: [source, developedNeighbor],
      getNeighbors: graphNeighbors({ A: ["B"], B: ["A"] }),
    })

    expect(updates.has("B")).toBe(false)
  })

  it("spreads seedQuantity from a cell at cap to an adjacent non-developed cell", () => {
    const source = cellOf({
      id: "A",
      infestation: BASE_CAP,
      resources: { [ResourceName.ORE]: 10 },
    })
    const target = cellOf({
      id: "B",
      infestation: 0,
      state: HexCellState.HIDDEN,
      resources: { [ResourceName.ORE]: 10 },
    })

    const updates = simulateTick({
      cells: [source, target],
      getNeighbors: graphNeighbors({ A: ["B"], B: ["A"] }),
    })

    const targetNext = updates.get("B")
    if (targetNext === undefined) throw new Error("expected an update for B")
    expect(targetNext).toBeGreaterThan(0)
  })
})

function graphNeighbors(
  adjacency: Record<string, readonly string[]>,
): (cellId: string) => readonly string[] {
  return cellId => adjacency[cellId] ?? []
}

// Test fixtures ─────────────────────────────────────────────────────────────

const baseResources = (): Record<ResourceName, number> => ({
  [ResourceName.ORE]: 0,
  [ResourceName.GAS]: 0,
  [ResourceName.CRYSTALS]: 0,
  [ResourceName.BIOMASS]: 0,
  [ResourceName.PLASMA]: 0,
  [ResourceName.ISOTOPES]: 0,
})

function cellOf(overrides: {
  id: string
  infestation?: number
  state?: HexCellState
  resources?: Partial<Record<ResourceName, number>>
}): BloomCellInput {
  return {
    id: overrides.id,
    state: overrides.state ?? HexCellState.HIDDEN,
    infestation: overrides.infestation ?? 0,
    resources: { ...baseResources(), ...overrides.resources },
  }
}
