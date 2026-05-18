// Store the configuration of the game, such as the number of planets, the size of the map, etc.

export const NUM_PLANETS = 3
export const MAP_SIZE = 5

// CELL CONFIG
// A storage unit is a fixed-size slot inside a warehouse that holds at most
// one type of resource. WAREHOUSE_UNIT_CAPACITY is the per-unit capacity;
// WAREHOUSE_UNITS is the number of units a freshly-generated warehouse has.
// The absolute storage capacity of a warehouse is the derived product.
export const WAREHOUSE_UNIT_CAPACITY = 8
export const WAREHOUSE_UNITS = 20

// SENSOR / SURVEY CONFIG
// SENSOR_RANGE is the radius (in hex steps) around any developed cell within
// which other cells are at least `sighted`. Cells at distance ≤ 1 auto-survey
// to `surveyed` for free; cells at distance 2..SENSOR_RANGE become `sighted`
// and require an explicit Survey action to reach `surveyed`. Defaults to 1
// (only immediate neighbors known); research and certain buildings extend it.
export const SENSOR_RANGE = 1
