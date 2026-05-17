/**
 * Map utilities — hex-grid neighbor resolution with wrap-around.
 *
 * The planet's hex grid wraps both axially (q within a row) and vertically
 * (r across rows), so neighbor lookups have to mirror that topology rather
 * than rely on a fixed bounding box.
 */
import type { Cell, CellCoord } from "../cell/types"
import { HexCellState } from "../cell/types"
import { type CellIndex } from "../cell/cellSlice"
import { parseCellId, getCellId } from "../cell/utils"

interface RowRange {
  qMin: number
  qMax: number
}

// FIXME: Should handle boundaries of the map wrap around it
export const getNeighborCoords = (
  cellCoord: CellCoord,
  cells: Cell[],
): CellCoord[] => {
  const { q, r } = cellCoord

  // build row ranges for wrapping
  const rows: Record<number, RowRange> = {}
  let minR = Infinity
  let maxR = -Infinity
  for (const c of cells) {
    const existing = rows[c.r]
    if (existing) {
      existing.qMin = Math.min(existing.qMin, c.q)
      existing.qMax = Math.max(existing.qMax, c.q)
    } else {
      rows[c.r] = { qMin: c.q, qMax: c.q }
    }
    minR = Math.min(minR, c.r)
    maxR = Math.max(maxR, c.r)
  }

  const rowCount = maxR - minR + 1
  const mod = (n: number, m: number) => ((n % m) + m) % m

  const wrapR = (rVal: number) => {
    if (rowCount <= 0) return rVal
    return minR + mod(rVal - minR, rowCount)
  }

  const wrapQForRow = (qVal: number, targetR: number) => {
    const row = rows[targetR]
    if (!row) return qVal
    const width = row.qMax - row.qMin + 1
    if (width <= 0) return qVal
    return row.qMin + mod(qVal - row.qMin, width)
  }

  const rawNeighbors: CellCoord[] = [
    { q: q + 1, r },
    { q: q - 1, r },
    { q, r: r + 1 },
    { q, r: r - 1 },
    { q: q + 1, r: r - 1 },
    { q: q - 1, r: r + 1 },
  ]

  return rawNeighbors.map(n => {
    const wrappedR = wrapR(n.r)
    const wrappedQ = wrapQForRow(n.q, wrappedR)
    return { q: wrappedQ, r: wrappedR }
  })
}

/**
 * Returns true if any neighboring cell is claimed.
 *
 * The map being a hex grid, each cell has 6 neighbors. The map does wrap around, so
 * neighbors are always found on the same planet.
 */
export function hasClaimedNeighbor(
  cellId: string,
  cellIndex: CellIndex,
): boolean {
  const { planetId, q, r } = parseCellId(cellId)
  const cells: Cell[] = []
  for (const c of Object.values(cellIndex)) {
    if (c && c.planetId === planetId) cells.push(c)
  }

  return getNeighborCoords({ q, r }, cells).some(coord => {
    const neighborId = getCellId(coord, planetId)
    const neighbor = cellIndex[neighborId]
    return neighbor?.state === HexCellState.DEVELOPED
  })
}
