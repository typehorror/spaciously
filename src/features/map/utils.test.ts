import { describe, it, expect } from "vitest"
import { getNeighborCoords, hasClaimedNeighbor } from "./utils"
import type { Cell } from "../cell/types"
import { ResourceName } from "../cell/types"

// construct a small toroidal map using the same coords style as cellGenerator
// rows: r = -1,0,1 each with q ranges
const makeCells = (): Cell[] => {
  const templateCell: Cell = {
    q: 0,
    r: 0,
    resources: {
      [ResourceName.ORE]: 0,
      [ResourceName.GAS]: 0,
      [ResourceName.CRYSTALS]: 0,
      [ResourceName.BIOMASS]: 0,
      [ResourceName.PLASMA]: 0,
      [ResourceName.ISOTOPES]: 0,
    },
    state: "unclaimed",
    planetId: 1,
    id: "1:0:0",
  }

  const cells: Cell[] = [
    { ...templateCell, id: "1:0:0", q: 0, r: 0, state: "claimed" },

    { ...templateCell, id: "1:-1:0", q: -1, r: 0, state: "unclaimed" },
    { ...templateCell, id: "1:-1:-1", q: -1, r: -1, state: "unclaimed" },
    { ...templateCell, id: "1:-1:1", q: -1, r: 1, state: "unclaimed" },

    { ...templateCell, id: "1:1:-1", q: 1, r: -1, state: "unclaimed" },
    { ...templateCell, id: "1:1:0", q: 1, r: 0, state: "unclaimed" },
    { ...templateCell, id: "1:1:1", q: 1, r: 1, state: "unclaimed" },

    { ...templateCell, id: "1:-2:0", q: -2, r: 0, state: "unclaimed" },
    { ...templateCell, id: "1:-2:-1", q: -2, r: -1, state: "unclaimed" },
    { ...templateCell, id: "1:-2:1", q: -2, r: 1, state: "unclaimed" },

    { ...templateCell, id: "1:2:-1", q: 2, r: -1, state: "unclaimed" },
    { ...templateCell, id: "1:2:0", q: 2, r: 0, state: "unclaimed" },
    { ...templateCell, id: "1:2:1", q: 2, r: 1, state: "unclaimed" },
  ]

  return cells
}

describe("map utils - wrapping", () => {
  it("wraps q when neighbor would be out of row bounds", () => {
    const cells = makeCells()
    // pick leftmost cell in r=0 (q=-2); neighbor q-1 should wrap to q=2
    const neighbors = getNeighborCoords({ q: -2, r: 0 }, cells)
    const leftNeighbor = neighbors.find(n => n.r === 0 && n.q === 2)
    expect(leftNeighbor).toBeDefined()
  })

  it("wraps r to opposite row when going out of vertical bounds", () => {
    const cells = makeCells()
    // from top row r=-1, r-1 should wrap to r=1
    const neighbors = getNeighborCoords({ q: 0, r: -1 }, cells)
    const wrapped = neighbors.find(n => n.r === 1)
    expect(wrapped).toBeDefined()
  })

  it("hasClaimedNeighbor finds neighbors across wrap", () => {
    const cells = makeCells()
    // claim a cell that is logically neighbor across the wrap
    const found = cells.find(c => c.q === 2 && c.r === 0)
    if (!found) throw new Error("setup failure")
    const claimed: Cell = { ...found, state: "claimed" }

    const index: Record<string, Cell> = {}
    for (const c of cells)
      index[`1-${c.q.toString()}-${c.r.toString()}`] = { ...c }
    index[claimed.id] = claimed

    // choose cell q=-2,r=0 which should have neighbor q=2,r=0 after wrap
    const has = hasClaimedNeighbor("1:-2:0", index)
    expect(has).toBe(true)
  })

  it("getNeighborCoords finds claimed neighbor around the center", () => {
    const cells = makeCells()
    const neighbors = getNeighborCoords({ q: 0, r: 0 }, cells)
    expect(neighbors).toEqual([
      { q: 1, r: 0 },
      { q: -1, r: 0 },
      { q: 0, r: 1 },
      { q: 0, r: -1 },
      { q: 1, r: -1 },
      { q: -1, r: 1 },
    ])
  })
})
