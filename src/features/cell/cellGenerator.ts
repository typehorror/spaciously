import { type NewCell } from "./types"
import { distributeResources } from "../resources/resources"

/**
 * Generate hexagonal map with projection (fewer hexes at top/bottom)
 */
export function cellGenerator(mapWidth: number, mapHeight: number): NewCell[] {
  const cells: NewCell[] = []
  const centerR = Math.floor(mapHeight / 2)

  for (let r = 0; r < mapHeight; r++) {
    // Calculate width for this row based on distance from center
    // to shape a slight ellipse
    const distanceFromCenter = Math.abs(r - centerR)
    const widthReduction = Math.floor(distanceFromCenter / 1.1)
    const rowWidth = Math.max(1, mapWidth - widthReduction)

    // Adjust r coordinate to be centered around 0
    const adjustedR = r - centerR

    // For hexagon grids, we need to offset q based on r to create proper alignment
    // This creates the "brick-like" pattern typical of hex grids
    const qOffset = Math.floor(adjustedR / 2)
    const startQ = -Math.floor(rowWidth / 2) - qOffset
    for (let i = 0; i < rowWidth; i++) {
      const q = startQ + i

      cells.push({
        q,
        r: adjustedR,
        state: "unclaimed",
        resources: distributeResources(),
      })
    }
  }

  return cells
}
