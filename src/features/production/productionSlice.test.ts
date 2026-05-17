/*
 * productionSlice tests
 *
 * Cross-slice behavior tests. Each test wires a real (cell + production)
 * store, dispatches actions through the public action creators, and asserts
 * on the resulting combined state via real selectors. Tests describe what
 * the system does (an order is added, a buffer is claimed, the energy draw
 * goes up) — not how the internal wiring works. They should survive a
 * refactor that preserves the cross-slice contract.
 */
import { describe, it, expect } from "vitest"
import { combineSlices, configureStore } from "@reduxjs/toolkit"
import { cellSlice, addCells } from "@/features/cell/cellSlice"
import {
  cycleDeposited,
  productionSlice,
  productionStarted,
  productionStopped,
  selectCanStartProduction,
  selectProductionEnergyDraw,
  selectProductionOrderByKey,
  selectRunningProductionOrders,
} from "./productionSlice"
import { getResourceQuantity } from "@/features/cell/warehouse"
import { WAREHOUSE_UNIT_CAPACITY } from "@/config"
import { type RootState } from "@/app/store"
import { getCellId } from "@/features/cell/utils"
import {
  HexCellState,
  ResourceName,
  type NewCell,
  type StorageUnitState,
} from "@/features/cell/types"

const PLANET_ID = 1

// Tests only exercise cell + production state, so the test store is a
// trimmed combine. Selectors that take a RootState are called with the
// trimmed state cast to RootState — they only read the slices that exist.
const makeStore = () => {
  const rootReducer = combineSlices(cellSlice, productionSlice)
  const store = configureStore({ reducer: rootReducer })
  return {
    dispatch: store.dispatch,
    getState: () => store.getState() as unknown as RootState,
  }
}

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

describe("productionStarted", () => {
  it("adds a production order and claims a buffer in the cell", () => {
    const store = makeStore()
    const cell = makeCell()
    const cellId = getCellId(cell, PLANET_ID)
    store.dispatch(addCells({ cells: [cell], planetId: PLANET_ID }))

    store.dispatch(
      productionStarted({
        cellId,
        productName: "OreExtractor",
        resource: ResourceName.ORE,
        duration: 1000,
        energyUsage: 5,
      }),
    )

    const state = store.getState()
    const order = selectProductionOrderByKey(state, cellId, "OreExtractor")
    expect(order).toMatchObject({
      cellId,
      productName: "OreExtractor",
      duration: 1000,
      energyUsage: 5,
    })
    expect(order?.startedAt).toBeGreaterThan(0)

    const warehouseUnits = state.cell.entities[cellId]?.warehouse.units
    expect(warehouseUnits).toEqual([
      {
        type: "buffer",
        productName: "OreExtractor",
        resource: ResourceName.ORE,
        quantity: 0,
      },
      { type: "empty" },
      { type: "empty" },
    ])
  })
})

describe("productionStopped", () => {
  it("removes the order and releases the buffer (empty buffer collapses to empty unit)", () => {
    const store = makeStore()
    const cell = makeCell()
    const cellId = getCellId(cell, PLANET_ID)
    store.dispatch(addCells({ cells: [cell], planetId: PLANET_ID }))
    store.dispatch(
      productionStarted({
        cellId,
        productName: "OreExtractor",
        resource: ResourceName.ORE,
        duration: 1000,
        energyUsage: 5,
      }),
    )

    store.dispatch(
      productionStopped({ cellId, productName: "OreExtractor" }),
    )

    const state = store.getState()
    expect(
      selectProductionOrderByKey(state, cellId, "OreExtractor"),
    ).toBeUndefined()
    expect(state.cell.entities[cellId]?.warehouse.units).toEqual([
      { type: "empty" },
      { type: "empty" },
      { type: "empty" },
    ])
  })

  it("spills accumulated buffer content into a stored unit when the buffer is non-empty", () => {
    // Preload state simulating a production that has run several cycles —
    // the buffer holds 5 Ore. Stopping must release the buffer and convert
    // the content to general storage (a stored unit) rather than discarding.
    const cell = makeCell({
      warehouse: {
        units: [
          {
            type: "buffer",
            productName: "OreExtractor",
            resource: ResourceName.ORE,
            quantity: 5,
          },
          { type: "empty" },
        ],
      },
    })
    const cellId = getCellId(cell, PLANET_ID)
    const store = makeStore()
    store.dispatch(addCells({ cells: [cell], planetId: PLANET_ID }))
    store.dispatch(
      productionStarted({
        cellId,
        productName: "OreExtractor",
        resource: ResourceName.ORE,
        duration: 1000,
        energyUsage: 5,
      }),
    )
    // productionStarted's claim-buffer side-effect is a no-op when a buffer
    // for this production already exists — preserves the seeded quantity.

    store.dispatch(productionStopped({ cellId, productName: "OreExtractor" }))

    const warehouse = store.getState().cell.entities[cellId]?.warehouse
    if (!warehouse) throw new Error("expected warehouse")
    expect(getResourceQuantity(warehouse, ResourceName.ORE)).toBe(5)
    expect(warehouse.units).toEqual([
      { type: "stored", resource: ResourceName.ORE, quantity: 5 },
      { type: "empty" },
    ])
  })
})

describe("cycleDeposited", () => {
  it("increments the buffer and advances the order's startedAt to begin the next cycle", () => {
    const store = makeStore()
    const cell = makeCell()
    const cellId = getCellId(cell, PLANET_ID)
    store.dispatch(addCells({ cells: [cell], planetId: PLANET_ID }))
    store.dispatch(
      productionStarted({
        cellId,
        productName: "OreExtractor",
        resource: ResourceName.ORE,
        duration: 1000,
        energyUsage: 5,
      }),
    )
    const startedAtBefore = selectProductionOrderByKey(
      store.getState(),
      cellId,
      "OreExtractor",
    )?.startedAt
    if (startedAtBefore === undefined) throw new Error("expected order")

    // Wait a tick so Date.now() advances; otherwise startedAt comparison
    // can't observe the advance.
    return new Promise<void>(resolve => {
      setTimeout(() => {
        store.dispatch(
          cycleDeposited({
            cellId,
            productName: "OreExtractor",
            quantity: 1,
          }),
        )

        const state = store.getState()
        const orderAfter = selectProductionOrderByKey(
          state,
          cellId,
          "OreExtractor",
        )
        expect(orderAfter?.startedAt).toBeGreaterThan(startedAtBefore)

        const warehouse = state.cell.entities[cellId]?.warehouse
        if (!warehouse) throw new Error("expected warehouse")
        expect(getResourceQuantity(warehouse, ResourceName.ORE)).toBe(1)
        resolve()
      }, 2)
    })
  })
})

describe("selectRunningProductionOrders", () => {
  it("includes orders whose buffer can accept another cycle's output", () => {
    const store = makeStore()
    const cell = makeCell()
    const cellId = getCellId(cell, PLANET_ID)
    store.dispatch(addCells({ cells: [cell], planetId: PLANET_ID }))
    store.dispatch(
      productionStarted({
        cellId,
        productName: "OreExtractor",
        resource: ResourceName.ORE,
        duration: 1000,
        energyUsage: 5,
      }),
    )

    const running = selectRunningProductionOrders(store.getState(), 1)
    expect(running.map(o => o.productName)).toEqual(["OreExtractor"])
  })

  it("excludes orders whose buffer is full AND no empty unit exists to roll over to", () => {
    // Buffer at UNIT_CAPACITY, no empty units available — the cycle has
    // nowhere to land, so the order is genuinely halted. (Per ADR-0001
    // rollover semantics, a full buffer alone is not halted if any empty
    // unit is available — that case rolls over instead; covered separately.)
    const cell = makeCell({
      warehouse: {
        units: [
          {
            type: "buffer",
            productName: "OreExtractor",
            resource: ResourceName.ORE,
            quantity: WAREHOUSE_UNIT_CAPACITY,
          },
        ],
      },
    })
    const cellId = getCellId(cell, PLANET_ID)
    const store = makeStore()
    store.dispatch(addCells({ cells: [cell], planetId: PLANET_ID }))
    store.dispatch(
      productionStarted({
        cellId,
        productName: "OreExtractor",
        resource: ResourceName.ORE,
        duration: 1000,
        energyUsage: 5,
      }),
    )

    expect(selectRunningProductionOrders(store.getState(), 1)).toEqual([])
  })

  it("keeps orders running when the buffer is full but an empty unit is available to roll over to", () => {
    const cell = makeCell({
      warehouse: {
        units: [
          {
            type: "buffer",
            productName: "OreExtractor",
            resource: ResourceName.ORE,
            quantity: WAREHOUSE_UNIT_CAPACITY,
          },
          { type: "empty" },
        ],
      },
    })
    const cellId = getCellId(cell, PLANET_ID)
    const store = makeStore()
    store.dispatch(addCells({ cells: [cell], planetId: PLANET_ID }))
    store.dispatch(
      productionStarted({
        cellId,
        productName: "OreExtractor",
        resource: ResourceName.ORE,
        duration: 1000,
        energyUsage: 5,
      }),
    )

    expect(
      selectRunningProductionOrders(store.getState(), 1).map(o => o.productName),
    ).toEqual(["OreExtractor"])
  })

  it("scopes to the requested planet", () => {
    const cellOnPlanet1 = makeCell()
    const cellOnPlanet2 = makeCell({ q: 1 })
    const cellId1 = getCellId(cellOnPlanet1, 1)
    const cellId2 = getCellId(cellOnPlanet2, 2)
    const store = makeStore()
    store.dispatch(addCells({ cells: [cellOnPlanet1], planetId: 1 }))
    store.dispatch(addCells({ cells: [cellOnPlanet2], planetId: 2 }))
    store.dispatch(
      productionStarted({
        cellId: cellId1,
        productName: "OreExtractor",
        resource: ResourceName.ORE,
        duration: 1000,
        energyUsage: 5,
      }),
    )
    store.dispatch(
      productionStarted({
        cellId: cellId2,
        productName: "GasExtractor",
        resource: ResourceName.GAS,
        duration: 1000,
        energyUsage: 3,
      }),
    )

    expect(
      selectRunningProductionOrders(store.getState(), 1).map(o => o.productName),
    ).toEqual(["OreExtractor"])
    expect(
      selectRunningProductionOrders(store.getState(), 2).map(o => o.productName),
    ).toEqual(["GasExtractor"])
  })
})

describe("selectCanStartProduction", () => {
  it("is true when the cell has an empty unit and no order yet exists", () => {
    const store = makeStore()
    const cell = makeCell()
    const cellId = getCellId(cell, PLANET_ID)
    store.dispatch(addCells({ cells: [cell], planetId: PLANET_ID }))

    expect(
      selectCanStartProduction(store.getState(), cellId, "OreExtractor"),
    ).toBe(true)
  })

  it("is false when an order for this production already exists", () => {
    const store = makeStore()
    const cell = makeCell()
    const cellId = getCellId(cell, PLANET_ID)
    store.dispatch(addCells({ cells: [cell], planetId: PLANET_ID }))
    store.dispatch(
      productionStarted({
        cellId,
        productName: "OreExtractor",
        resource: ResourceName.ORE,
        duration: 1000,
        energyUsage: 5,
      }),
    )

    expect(
      selectCanStartProduction(store.getState(), cellId, "OreExtractor"),
    ).toBe(false)
  })

  it("is false when the warehouse has no empty unit to claim", () => {
    const cell = makeCell({
      warehouse: {
        units: [
          { type: "stored", resource: ResourceName.GAS, quantity: 3 },
          {
            type: "buffer",
            productName: "AnotherProduction",
            resource: ResourceName.CRYSTALS,
            quantity: 0,
          },
        ],
      },
    })
    const cellId = getCellId(cell, PLANET_ID)
    const store = makeStore()
    store.dispatch(addCells({ cells: [cell], planetId: PLANET_ID }))

    expect(
      selectCanStartProduction(store.getState(), cellId, "OreExtractor"),
    ).toBe(false)
  })
})

describe("selectProductionEnergyDraw", () => {
  it("sums energyUsage across running orders on the planet", () => {
    const cellA = makeCell()
    const cellB = makeCell({ q: 1 })
    const cellIdA = getCellId(cellA, PLANET_ID)
    const cellIdB = getCellId(cellB, PLANET_ID)
    const store = makeStore()
    store.dispatch(addCells({ cells: [cellA, cellB], planetId: PLANET_ID }))
    store.dispatch(
      productionStarted({
        cellId: cellIdA,
        productName: "OreExtractor",
        resource: ResourceName.ORE,
        duration: 1000,
        energyUsage: 5,
      }),
    )
    store.dispatch(
      productionStarted({
        cellId: cellIdB,
        productName: "GasExtractor",
        resource: ResourceName.GAS,
        duration: 1000,
        energyUsage: 3,
      }),
    )

    expect(selectProductionEnergyDraw(store.getState(), PLANET_ID)).toBe(8)
  })

  it("excludes halted orders (full buffer AND no empty unit to roll over to)", () => {
    const cell = makeCell({
      warehouse: {
        units: [
          {
            type: "buffer",
            productName: "OreExtractor",
            resource: ResourceName.ORE,
            quantity: WAREHOUSE_UNIT_CAPACITY,
          },
        ],
      },
    })
    const cellId = getCellId(cell, PLANET_ID)
    const store = makeStore()
    store.dispatch(addCells({ cells: [cell], planetId: PLANET_ID }))
    store.dispatch(
      productionStarted({
        cellId,
        productName: "OreExtractor",
        resource: ResourceName.ORE,
        duration: 1000,
        energyUsage: 7,
      }),
    )

    expect(selectProductionEnergyDraw(store.getState(), PLANET_ID)).toBe(0)
  })
})
