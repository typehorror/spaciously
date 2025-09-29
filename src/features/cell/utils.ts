import type { CellCoord } from "./types"
import { type Warehouse } from "./types"

export const WAREHOUSE_UNIT_CAPACITY = 8

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
export function parseCellId(id: string): CellCoord & { planetId: number } {
  let [planetId, q, r] = id.split(":").map(Number)
  planetId = planetId ?? 1
  q = q ?? 0
  r = r ?? 0
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

export const getAvailableSpaceForResource = (
  warehouse: Warehouse,
  resource: string,
) => {
  let availableUnits = warehouse.capacity
  let availableForResource = 0
  for (const resourceName in warehouse.content) {
    const resourceQty = warehouse.content[resourceName] ?? 0

    availableUnits -= Math.ceil(resourceQty / WAREHOUSE_UNIT_CAPACITY)
    if (resourceName === resource) {
      const remainder = resourceQty % WAREHOUSE_UNIT_CAPACITY
      if (remainder > 0) {
        availableForResource += WAREHOUSE_UNIT_CAPACITY - remainder
      }
    }
  }
  return availableForResource + availableUnits * WAREHOUSE_UNIT_CAPACITY
}

interface StorageUnit {
  resource: string | null
  quantity: number
}
/**
 * Allows for a simplified rendering by iterating over storage units
 * @param warehouse
 */
export const getStorageUnits = (warehouse: Warehouse): StorageUnit[] => {
  const storageUnits: StorageUnit[] = []
  for (const resourceName in warehouse.content) {
    const resourceQty = warehouse.content[resourceName] ?? 0
    const fullUnits = Math.floor(resourceQty / WAREHOUSE_UNIT_CAPACITY)
    // const usedUnits = Math.ceil(resourceQty / WAREHOUSE_UNIT_CAPACITY)
    const remainder = resourceQty % WAREHOUSE_UNIT_CAPACITY

    for (let i = 0; i < fullUnits; i++) {
      storageUnits.push({
        resource: resourceName,
        quantity: WAREHOUSE_UNIT_CAPACITY,
      })
    }

    if (remainder > 0 && storageUnits.length < warehouse.capacity) {
      storageUnits.push({
        resource: resourceName,
        quantity: remainder,
      })
    }
  }

  // add the empty units
  for (let i = storageUnits.length; i < warehouse.capacity; i++) {
    storageUnits.push({ resource: null, quantity: 0 })
  }

  return storageUnits
}
