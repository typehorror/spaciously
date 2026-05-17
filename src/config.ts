// Store the configuration of the game, such as the number of planets, the size of the map, etc.

export const NUM_PLANETS = 3
export const MAP_SIZE = 5

// CELL CONFIG
// A unit is a block that may only contain one type of resource,
// and has a fixed capacity. This allows for a simplified rendering and
// management of the warehouse content.
export const WAREHOUSE_UNIT_CAPACITY = 8

// The total warehouse capacity of a cell should be a multiple of the unit
// capacity to avoid rendering issues with partial units.
export const WAREHOUSE_CAPACITY = WAREHOUSE_UNIT_CAPACITY * 20
