export interface CellCoord {
  q: number
  r: number
}

export enum HexCellState {
  REVEALED = "Revealed",
  HIDDEN = "Hidden",
  DEVELOPED = "Developed",
}

export type WarehouseContent = Partial<Record<string, number>>

export interface NewCell extends CellCoord {
  /**
   * Resource distribution on this cell (hex).
   */
  resources: Record<ResourceName, number>

  /**
   * The state can either be "wild" (unclaimed) or "developed" (claimed by player).
   */
  state: HexCellState
  /**
   * Number of building slots available on this cell.
   */
  slots: number

  /**
   * The warehouse associated with this cell.
   */
  warehouse: Warehouse

  /**
   * The habitat associated with this cell, if any.
   */
  habitat: Habitat
}

export interface Habitat {
  population: number
  capacity: number
}

/**
 * A storage unit's current role. Each unit holds at most one resource type
 * (up to WAREHOUSE_UNIT_CAPACITY) and is either: empty (unused), stored
 * (general player storage), or buffer (reserved by a production as the
 * exclusive destination for its output — sealed to all other inputs).
 *
 * See docs/adr/0001-buffered-production-with-derived-halt.md and the Buffer
 * entry in CONTEXT.md.
 */
export type StorageUnitState =
  | { type: "empty" }
  | { type: "stored"; resource: string; quantity: number }
  | { type: "buffer"; productName: string; resource: string; quantity: number }

export interface Warehouse {
  /**
   * Ordered list of storage units. Capacity is `units.length * WAREHOUSE_UNIT_CAPACITY`.
   * Unit ordering is stable for rendering; never reorder in mutations.
   *
   * Resource quantities are derived: sum the `quantity` of `stored` and
   * `buffer` units of the same resource. Use `getResourceQuantity` from
   * `features/cell/warehouse` rather than computing this inline.
   */
  units: StorageUnitState[]
}

export type Cell = NewCell & {
  planetId: number
  id: string
}

export enum ResourceName {
  ORE = "Ore",
  GAS = "Gas",
  CRYSTALS = "Crystals",
  BIOMASS = "Biomass",
  PLASMA = "Plasma",
  ISOTOPES = "Isotopes",
}

export interface PlanetBoundaries {
  qMin: number
  qMax: number
  rMin: number
  rMax: number
}
