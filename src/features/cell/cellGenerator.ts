import { type NewCell } from "./types"
import { distributeResources } from "../resources/resources"

/**
 * Generate hexagonal map with projection (fewer hexes at top/bottom)
 */
export function cellGenerator(size: number): NewCell[] {
  const cells: NewCell[] = []
  for (let q = -size; q <= size; q++) {
    const r1 = Math.max(-size, -q - size)
    const r2 = Math.min(size, -q + size)
    for (let r = r1; r <= r2; r++) {
      cells.push({ q, r, state: "unclaimed", resources: distributeResources() })
    }
  }

  return cells
}
