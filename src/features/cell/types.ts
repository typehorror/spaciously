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

export interface Warehouse {
  /**
   * The storage capacity of the cell's warehouse, if any.
   */
  capacity: number
  /**
   * The amount of resources currently stored in the cell's warehouse.
   */
  content: WarehouseContent
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
