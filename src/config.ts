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

// BLOOM CONFIG
// Per-tick growth/cap/spread defaults. Each cell's effective rates are these
// bases multiplied by per-resource coefficients (BLOOM_RESOURCE_MULTIPLIERS)
// driven by the cell's resource composition. Direction is committed in
// ADR-0002 §3; numbers here are starting points and will tune during
// playtest.
export const BASE_GROWTH_RATE = 1
export const BASE_CAP = 10
export const BASE_SEED_QUANTITY = 1
// Probability, per tick, that a gas-rich cell at cap airborne-seeds a
// non-adjacent hidden cell — the sole probabilistic element in spread.
export const GAS_AIRBORNE_PROBABILITY = 0.05

// One Bloom simulation tick every N real milliseconds. The Bloom is slow
// by design — fast enough that the player feels pressure over a session,
// not so fast that they can't react.
export const BLOOM_TICK_INTERVAL_MS = 5_000

// Multipliers applied to BASE_GROWTH_RATE / BASE_CAP per unit of each
// resource present on a cell. Direction: Biomass accelerates, Crystals
// resist, Plasma/Isotopes slow (and will mutate seeds in a v2 pass), Gas is
// neutral for growth (its weight is on the airborne path), Ore is neutral.
export const BLOOM_RESOURCE_GROWTH_PER_UNIT = {
  Ore: 0,
  Gas: 0,
  Crystals: -0.05,
  Biomass: 0.1,
  Plasma: -0.05,
  Isotopes: -0.05,
}
export const BLOOM_RESOURCE_CAP_PER_UNIT = {
  Ore: 0,
  Gas: 0,
  Crystals: -0.05,
  Biomass: 0.1,
  Plasma: 0,
  Isotopes: 0,
}

// INFECTION CONFIG
// The starting planet's first-contact event (ADR-0002 §9, CONTEXT.md
// "Infection"). Fires exactly once per game when both floors are met:
//
//   - INFECTION_TIME_FLOOR_MS — elapsed game time since startGame()
//   - INFECTION_DEVELOPED_CELL_FLOOR — count of developed cells on the
//     starting planet
//   - INFECTION_BUILDING_FLOOR — count of player buildings on the
//     starting planet
//
// On fire, the chosen developed cell's infestation jumps to
// INFECTION_INITIAL_INFESTATION_RATIO of its per-cell cap. Numbers are
// tunable starting points; the brief calls out "~10 minutes" and "~30%
// of cap" as the design intent.
export const INFECTION_TIME_FLOOR_MS = 10 * 60 * 1000
export const INFECTION_DEVELOPED_CELL_FLOOR = 3
export const INFECTION_BUILDING_FLOOR = 5
export const INFECTION_INITIAL_INFESTATION_RATIO = 0.3
