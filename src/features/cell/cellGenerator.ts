import { HexCellState, type NewCell } from "./types"
import { distributeResources } from "../resources/resources"
import { WAREHOUSE_UNITS } from "@/config"

/**
 * Generate hexagonal map with projection (fewer hexes at top/bottom)
 */
export function cellGenerator(size: number): NewCell[] {
  const cells: NewCell[] = []
  for (let q = -size; q <= size; q++) {
    const r1 = Math.max(-size, -q - size)
    const r2 = Math.min(size, -q + size)
    for (let r = r1; r <= r2; r++) {
      cells.push({
        q,
        r,
        state: HexCellState.HIDDEN,
        resources: distributeResources(),
        slots: 4,
        warehouse: {
          units: Array.from({ length: WAREHOUSE_UNITS }, () => ({
            type: "empty",
          })),
        },
        habitat: { population: 0, capacity: 0 },
      })
    }
  }

  return cells
}
