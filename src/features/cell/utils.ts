import type { CellCoord } from "./types"

/**
 * Generates a unique cell ID based on its coordinates and planet ID.
 * @param coord The coordinates of the cell.
 * @param planetId The ID of the planet the cell is on.
 * @returns The unique cell ID.
 */
export function getCellId(coord: CellCoord, planetId: number): string {
  return `${planetId.toString()}:${coord.q.toString()}:${coord.r.toString()}`
}

/**
 * Extracts the cell coordinates and planet ID from a cell ID.
 * @param id The cell ID to extract information from.
 * @returns An object containing the cell coordinates and planet ID.
 */
export function getCellCoordFromId(
  id: string,
): CellCoord & { planetId: number } {
  const [planetId, q, r] = id.split(":").map(Number)
  return { planetId, q, r }
}

export type CellRef =
  | { cellId: string }
  | { coord: CellCoord; planetId: number }
  | { q: number; r: number; planetId: number } // the source is a cell
/**
 * Extracts the cell information from any Cell referencing payload,
 * regardless of whether it's provided by coordinate/planetId or cellId.
 *
 * @param payload The payload containing building and cell information.
 * @returns An object containing the extracted cellId and building.
 */
export function resolveCellId<T extends CellRef>(
  input: T,
): T & { cellId: string } {
  if ("cellId" in input) {
    return { ...input, cellId: input.cellId }
  }
  if ("q" in input && "r" in input && "planetId" in input) {
    return {
      ...input,
      cellId: getCellId({ q: input.q, r: input.r }, input.planetId),
    }
  }
  return {
    ...input,
    cellId: getCellId(input.coord, input.planetId),
  }
}
