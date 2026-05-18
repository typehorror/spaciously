/*
 * survey/range — sensor-coverage computation
 *
 * Pure module. Given a planet's developed cells, a sensor range, and an
 * adjacency function, classifies non-developed cells into two coverage
 * sets:
 *
 *   - `autoSurveyed` — cells at distance ≤ 1 from any developed cell.
 *     The cellSlice reducer promotes these directly to `surveyed`.
 *   - `sighted`      — cells at distance in (1, sensorRange] from any
 *     developed cell. The reducer promotes these to `sighted`.
 *
 * The neighbor function is injected so this module has no coupling to hex
 * coordinates, planet boundaries, or wrap logic. Tests use synthetic
 * topologies; in the running app the function is built from the planet's
 * cell index.
 *
 * Stickiness (a cell, once surveyed, stays surveyed) is *not* this module's
 * concern — it lives in the reducer that consumes this output.
 */

export interface SensorCoverage {
  /** Cells within auto-survey range (distance ≤ 1) — promote to `surveyed`. */
  autoSurveyed: Set<string>
  /** Cells beyond auto-survey but within sensor range — promote to `sighted`. */
  sighted: Set<string>
}

export function computeSensorCoverage(
  developedCellIds: ReadonlySet<string>,
  sensorRange: number,
  getNeighbors: (cellId: string) => readonly string[],
): SensorCoverage {
  const autoSurveyed = new Set<string>()
  const sighted = new Set<string>()

  // BFS from the developed-cell frontier outward, tracking each visited
  // cell's minimum distance. Cells at distance 1 go into autoSurveyed; cells
  // at distance 2..sensorRange go into sighted; cells beyond range are not
  // visited at all.
  const distance = new Map<string, number>()
  let frontier: string[] = []

  for (const id of developedCellIds) {
    distance.set(id, 0)
    frontier.push(id)
  }

  while (frontier.length > 0) {
    const next: string[] = []
    for (const cellId of frontier) {
      const currentDistance = distance.get(cellId) ?? 0
      if (currentDistance >= sensorRange) continue

      for (const neighbor of getNeighbors(cellId)) {
        if (distance.has(neighbor)) continue
        const neighborDistance = currentDistance + 1
        distance.set(neighbor, neighborDistance)
        next.push(neighbor)

        if (neighborDistance === 1) {
          autoSurveyed.add(neighbor)
        } else {
          sighted.add(neighbor)
        }
      }
    }
    frontier = next
  }

  return { autoSurveyed, sighted }
}
