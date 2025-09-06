import { type ProductName } from "../building/types"

export enum ResourceName {
  ORE = "Ore",
  GAS = "Gas",
  CRYSTALS = "Crystals",
  BIOMASS = "Biomass",
  PLASMA = "Plasma",
  ISOTOPES = "Isotopes",
}

export enum GeneratedResourceName {
  ENERGY = "Energy",
  POPULATION = "Population",
}

export type AllResourceNames =
  | ResourceName
  | GeneratedResourceName
  | ProductName
