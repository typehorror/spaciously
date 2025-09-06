import { describe, it, expect } from "vitest"
import {
  getAvailableSpaceForResource,
  getStorageUnits,
  WAREHOUSE_UNIT_CAPACITY,
} from "./utils"
import type { WarehouseContent } from "./types"

describe("warehouse utils", () => {
  it("returns full empty capacity for an empty warehouse", () => {
    const w: WarehouseContent = {
      cellId: "c",
      id: "w",
      content: {},
      capacity: 3,
    }
    expect(getAvailableSpaceForResource(w, "iron")).toBe(
      3 * WAREHOUSE_UNIT_CAPACITY,
    )
    const units = getStorageUnits(w)
    expect(units).toHaveLength(3)
    expect(units.every(u => u.resource === null && u.quantity === 0)).toBe(true)
  })

  it("counts partial unit for a resource and includes empty units", () => {
    const w: WarehouseContent = {
      cellId: "c",
      id: "w",
      content: { iron: 5 },
      capacity: 3,
    }
    // one used unit (ceil(5/8)=1), partial free in that unit = 3, plus 2 full empty units
    expect(getAvailableSpaceForResource(w, "iron")).toBe(
      3 + 2 * WAREHOUSE_UNIT_CAPACITY,
    )

    const units = getStorageUnits(w)
    expect(units).toHaveLength(3)
    // should contain one unit with quantity 5 and two empty units
    const filled = units.filter(u => u.resource === "iron")
    expect(filled).toHaveLength(1)
    expect(filled[0].quantity).toBe(5)
  })

  it("does not count other resources partial space when asking for a different resource", () => {
    const w: WarehouseContent = {
      cellId: "c",
      id: "w",
      content: { iron: 5, copper: 4 },
      capacity: 3,
    }
    // iron: uses 1 unit (partial 3), copper: uses 1 unit (partial 4)
    // available units = 3 - (1+1) = 1 -> 1*8 = 8
    // asking space for iron: iron has partial 3, so total = 3 + 8 = 11
    expect(getAvailableSpaceForResource(w, "iron")).toBe(
      3 + 1 * WAREHOUSE_UNIT_CAPACITY,
    )
    // asking space for a resource not present should be only the empty units
    expect(getAvailableSpaceForResource(w, "gold")).toBe(
      1 * WAREHOUSE_UNIT_CAPACITY,
    )
  })

  it("respects warehouse capacity when many resources present", () => {
    const w: WarehouseContent = {
      cellId: "c",
      id: "w",
      content: { a: 8, b: 8, c: 3, d: 1 },
      capacity: 4,
    }
    // a:1 used, b:1 used, c:1 used (partial), d:1 used (partial) => total used units = 4
    // no empty units, asking for any resource should only consider partial in that resource
    // for c (3): partial free = 8-3=5
    expect(getAvailableSpaceForResource(w, "c")).toBe(5)

    const units = getStorageUnits(w)
    expect(units).toHaveLength(4)
    // there should be exactly 4 non-empty units (no nulls)
    expect(units.filter(u => u.resource !== null)).toHaveLength(4)
  })

  it("storage units for exact multiples produce full units and no extra partial", () => {
    const w: WarehouseContent = {
      cellId: "c",
      id: "w",
      content: { iron: 16 },
      capacity: 4,
    }
    // 16 -> two full units of 8
    const units = getStorageUnits(w)
    expect(units).toHaveLength(4)
    const ironUnits = units.filter(u => u.resource === "iron")
    expect(ironUnits).toHaveLength(2)
    expect(ironUnits.every(u => u.quantity === WAREHOUSE_UNIT_CAPACITY)).toBe(
      true,
    )
    // remaining units should be empty
    expect(units.filter(u => u.resource === null)).toHaveLength(2)
  })
})
