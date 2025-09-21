export type CellCoord = {
  q: number
  r: number
}

export type NewCell = CellCoord & {
  resources: Record<ResourceName, number>
  state: "claimed" | "unclaimed"
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

export type PlanelBoundaries = {
  qMin: number
  qMax: number
  rMin: number
  rMax: number
}
