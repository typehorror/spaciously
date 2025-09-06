import type { Cell, CellCoord } from "../cell/types"
import { type CellIndex } from "../cell/cellSlice"
import { getCellCoordFromId, getCellId } from "../cell/utils"

// FIXME: Should handle boundaries of the map wrap around it
export const getNeighborCoords = (cellCoord: CellCoord, cells: Cell[]) => {
  const { q, r } = cellCoord

  // build row ranges for wrapping
  const rows: Record<number, { qMin: number; qMax: number }> = {}
  let minR = Infinity
  let maxR = -Infinity
  for (const c of cells) {
    if (!(c.r in rows)) {
      rows[c.r] = { qMin: c.q, qMax: c.q }
    } else {
      rows[c.r].qMin = Math.min(rows[c.r].qMin, c.q)
      rows[c.r].qMax = Math.max(rows[c.r].qMax, c.q)
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
    if (!(targetR in rows)) return qVal
    const row = rows[targetR]
    const width = row.qMax - row.qMin + 1
    if (width <= 0) return qVal
    return row.qMin + mod(qVal - row.qMin, width)
  }

  const rawNeighbors = [
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
 * @param cellId
 * @param cellIndex
 * @returns
 */
export function hasClaimedNeighbor(
  cellId: string,
  cellIndex: CellIndex,
): boolean {
  const { planetId, q, r } = getCellCoordFromId(cellId)
  const cells = Object.values(cellIndex)
    .filter(c => c !== undefined)
    .filter(c => c.planetId === planetId)

  return getNeighborCoords({ q, r }, cells).some(coord => {
    const cellId = getCellId(coord, planetId)
    const neighbor = cellIndex[cellId]
    return neighbor && neighbor.state === "claimed"
  })
}
