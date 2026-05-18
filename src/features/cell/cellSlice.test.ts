import { describe, it, expect } from "vitest"
import {
  cellSlice,
  addCells,
  addToWarehouse,
  cellSurveyed,
  terraformCell,
} from "./cellSlice"
import { getCellId } from "./utils"
import { getResourceQuantity } from "./warehouse"
import {
  HexCellState,
  ResourceName,
  type NewCell,
  type StorageUnitState,
} from "./types"
import { WAREHOUSE_UNIT_CAPACITY } from "@/config"

const PLANET_ID = 1

const emptyUnits = (count: number): StorageUnitState[] =>
  Array.from({ length: count }, () => ({ type: "empty" }))

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
  warehouse: { units: emptyUnits(3) },
  habitat: { population: 0, capacity: 0 },
  ...overrides,
})

const seed = (cell: NewCell = makeCell()) =>
  cellSlice.reducer(
    undefined,
    addCells({ cells: [cell], planetId: PLANET_ID }),
  )

const cellIdOf = (cell: NewCell) => getCellId(cell, PLANET_ID)

describe("auto-survey on addCells", () => {
  it("promotes a hidden neighbor of a developed cell to surveyed", () => {
    const developed = makeCell({
      q: 0,
      r: 0,
      state: HexCellState.DEVELOPED,
    })
    const neighbor = makeCell({
      q: 1,
      r: 0,
      state: HexCellState.HIDDEN,
    })

    const state = cellSlice.reducer(
      undefined,
      addCells({ cells: [developed, neighbor], planetId: PLANET_ID }),
    )

    expect(state.entities[cellIdOf(neighbor)]?.state).toBe(
      HexCellState.SURVEYED,
    )
  })
})

describe("cellSurveyed", () => {
  it("promotes a sighted cell to surveyed", () => {
    const cell = makeCell({ q: 0, r: 0, state: HexCellState.SIGHTED })
    const cellId = cellIdOf(cell)
    const initial = cellSlice.reducer(
      undefined,
      addCells({ cells: [cell], planetId: PLANET_ID }),
    )

    const next = cellSlice.reducer(initial, cellSurveyed({ cellId }))

    expect(next.entities[cellId]?.state).toBe(HexCellState.SURVEYED)
  })
})

describe("terraformCell", () => {
  it("rejects a hidden cell — terraform requires a surveyed cell first", () => {
    const cell = makeCell({ q: 0, r: 0, state: HexCellState.HIDDEN })
    const cellId = cellIdOf(cell)
    const initial = cellSlice.reducer(
      undefined,
      addCells({ cells: [cell], planetId: PLANET_ID }),
    )

    const next = cellSlice.reducer(initial, terraformCell({ cellId }))

    expect(next.entities[cellId]?.state).toBe(HexCellState.HIDDEN)
  })

  it("promotes a surveyed cell to developed", () => {
    // The neighbor at (1,0) starts hidden but is auto-surveyed by the
    // developed center cell, so it is `surveyed` after addCells — the
    // precondition for terraform.
    const developed = makeCell({
      q: 0,
      r: 0,
      state: HexCellState.DEVELOPED,
    })
    const neighbor = makeCell({ q: 1, r: 0, state: HexCellState.HIDDEN })
    const neighborId = cellIdOf(neighbor)
    const initial = cellSlice.reducer(
      undefined,
      addCells({ cells: [developed, neighbor], planetId: PLANET_ID }),
    )

    const next = cellSlice.reducer(
      initial,
      terraformCell({ cellId: neighborId }),
    )

    expect(next.entities[neighborId]?.state).toBe(HexCellState.DEVELOPED)
  })
})

describe("addToWarehouse", () => {
  it("clips a distinct-resource add when no free storage unit remains", () => {
    const cell = makeCell({ warehouse: { units: emptyUnits(3) } })
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

    const warehouse = state.entities[cellId]?.warehouse
    if (!warehouse) throw new Error("expected warehouse to exist")
    expect(getResourceQuantity(warehouse, ResourceName.ORE)).toBe(1)
    expect(getResourceQuantity(warehouse, ResourceName.GAS)).toBe(1)
    expect(getResourceQuantity(warehouse, ResourceName.CRYSTALS)).toBe(1)
    expect(getResourceQuantity(warehouse, ResourceName.BIOMASS)).toBe(0)
  })

  it("clips a same-resource add to the remaining space of its current partial unit", () => {
    const cell = makeCell({
      warehouse: {
        units: [
          {
            type: "stored",
            resource: ResourceName.ORE,
            quantity: WAREHOUSE_UNIT_CAPACITY - 1,
          },
        ],
      },
    })
    const cellId = cellIdOf(cell)
    const state = cellSlice.reducer(
      seed(cell),
      addToWarehouse({ cellId, resource: ResourceName.ORE, quantity: 5 }),
    )

    const warehouse = state.entities[cellId]?.warehouse
    if (!warehouse) throw new Error("expected warehouse to exist")
    expect(getResourceQuantity(warehouse, ResourceName.ORE)).toBe(
      WAREHOUSE_UNIT_CAPACITY,
    )
  })

  it("clips a same-resource add to zero when the only unit is full", () => {
    const cell = makeCell({
      warehouse: {
        units: [
          {
            type: "stored",
            resource: ResourceName.ORE,
            quantity: WAREHOUSE_UNIT_CAPACITY,
          },
        ],
      },
    })
    const cellId = cellIdOf(cell)
    const state = cellSlice.reducer(
      seed(cell),
      addToWarehouse({ cellId, resource: ResourceName.ORE, quantity: 1 }),
    )

    const warehouse = state.entities[cellId]?.warehouse
    if (!warehouse) throw new Error("expected warehouse to exist")
    expect(getResourceQuantity(warehouse, ResourceName.ORE)).toBe(
      WAREHOUSE_UNIT_CAPACITY,
    )
  })

  it("opens a second unit for the same resource when a free unit is available", () => {
    const cell = makeCell({
      warehouse: {
        units: [
          {
            type: "stored",
            resource: ResourceName.ORE,
            quantity: WAREHOUSE_UNIT_CAPACITY - 1,
          },
          { type: "empty" },
        ],
      },
    })
    const cellId = cellIdOf(cell)
    const state = cellSlice.reducer(
      seed(cell),
      addToWarehouse({ cellId, resource: ResourceName.ORE, quantity: 5 }),
    )

    const warehouse = state.entities[cellId]?.warehouse
    if (!warehouse) throw new Error("expected warehouse to exist")
    expect(getResourceQuantity(warehouse, ResourceName.ORE)).toBe(
      WAREHOUSE_UNIT_CAPACITY + 4,
    )
  })
})
