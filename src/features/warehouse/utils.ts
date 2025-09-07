import { type Warehouse } from "./types"

export const WAREHOUSE_UNIT_CAPACITY = 8

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

type StorageUnit = {
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
