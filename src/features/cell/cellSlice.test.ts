import { describe, it, expect } from "vitest"
import { cellSlice, addCells, addToWarehouse } from "./cellSlice"
import { getCellId } from "./utils"
import { HexCellState, ResourceName, type NewCell } from "./types"

const PLANET_ID = 1

const makeCell = (overrides: Partial<NewCell> = {}): NewCell => ({
  q: 0,
  r: 0,
  state: HexCellState.DEVELOPED,
  resources: {
    [ResourceName.ORE]: 0,
    [ResourceName.GAS]: 0,
    [ResourceName.CRYSTALS]: 0,
    [ResourceName.BIOMASS]: 0,
    [ResourceName.PLASMA]: 0,
    [ResourceName.ISOTOPES]: 0,
  },
  slots: 4,
  warehouse: { units: 3, content: {} },
  habitat: { population: 0, capacity: 0 },
  ...overrides,
})

const seed = (cell: NewCell = makeCell()) =>
  cellSlice.reducer(
    undefined,
    addCells({ cells: [cell], planetId: PLANET_ID }),
  )

const cellIdOf = (cell: NewCell) => getCellId(cell, PLANET_ID)

describe("addToWarehouse", () => {
  it("clips a distinct-resource add when no free storage unit remains", () => {
    const cell = makeCell({ warehouse: { units: 3, content: {} } })
    const cellId = cellIdOf(cell)
    let state = seed(cell)

    for (const resource of [
      ResourceName.ORE,
      ResourceName.GAS,
      ResourceName.CRYSTALS,
      ResourceName.BIOMASS,
    ]) {
      state = cellSlice.reducer(
        state,
        addToWarehouse({ cellId, resource, quantity: 1 }),
      )
    }

    const stored = state.entities[cellId]?.warehouse.content
    expect(stored).toEqual({
      [ResourceName.ORE]: 1,
      [ResourceName.GAS]: 1,
      [ResourceName.CRYSTALS]: 1,
    })
  })

  it("clips a same-resource add to the remaining space of its current partial unit", () => {
    const cell = makeCell({
      warehouse: { units: 1, content: { [ResourceName.ORE]: 7 } },
    })
    const cellId = cellIdOf(cell)
    const state = cellSlice.reducer(
      seed(cell),
      addToWarehouse({ cellId, resource: ResourceName.ORE, quantity: 5 }),
    )

    expect(state.entities[cellId]?.warehouse.content).toEqual({
      [ResourceName.ORE]: 8,
    })
  })

  it("clips a same-resource add to zero when the only unit is full", () => {
    const cell = makeCell({
      warehouse: { units: 1, content: { [ResourceName.ORE]: 8 } },
    })
    const cellId = cellIdOf(cell)
    const state = cellSlice.reducer(
      seed(cell),
      addToWarehouse({ cellId, resource: ResourceName.ORE, quantity: 1 }),
    )

    expect(state.entities[cellId]?.warehouse.content).toEqual({
      [ResourceName.ORE]: 8,
    })
  })

  it("opens a second unit for the same resource when a free unit is available", () => {
    const cell = makeCell({
      warehouse: { units: 2, content: { [ResourceName.ORE]: 7 } },
    })
    const cellId = cellIdOf(cell)
    const state = cellSlice.reducer(
      seed(cell),
      addToWarehouse({ cellId, resource: ResourceName.ORE, quantity: 5 }),
    )

    expect(state.entities[cellId]?.warehouse.content).toEqual({
      [ResourceName.ORE]: 12,
    })
  })
})
