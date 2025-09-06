import { type NewProduction } from "../production/types"
import type {
  AllResourceNames,
  GeneratedResourceName,
  ResourceName,
} from "../resources/types"

export enum ProductName {
  AMMO = "Ammo",
}

export type Product = {
  name: ProductName
  cost: Partial<Record<ResourceName | ProductName, number>>
  density: number // quantity per unit volume
}

export type Resource = {
  name: ResourceName
  density: number // quantity per unit volume
}

export enum BuildingName {
  COLONY_LANDER = "Colony Lander",
}

// Reusable type for multipliers (e.g., { "population": 0.1 })
type MultiplierRecord = Record<
  GeneratedResourceName.POPULATION | "level",
  number
>

// Type for maintenance items
export type MaintenanceCost = {
  resource: AllResourceNames
  quantity: number
  period: number // Time in ms between maintenance checks
  multiplier: Partial<MultiplierRecord>
}

// Type for habitat details
export type Habitat = {
  population: number
  capacity: number
}

// Type for warehouse (item storage)
export type Warehouse = {
  content: Partial<Record<ResourceName | ProductName, number>>
  capacity: number
}

export type ProductionModifier = Pick<NewProduction, "name"> &
  Partial<Omit<NewProduction, "name">>

// Type for expansion modifiers
export type ExpansionModifier = {
  population?: {
    capacity: number
  }
  production?: ProductionModifier[]
}

// Type for expansions
export type Expansion = {
  name: string
  description: string
  level: number
  cost: Partial<Record<ResourceName | ProductName, number>>
  modifier: ExpansionModifier
}

// Main type for Colony Lander (or general Building, extensible)
export type NewBuilding = {
  name: string
  description: string
  level: number
  cost: Partial<Record<ResourceName | ProductName, number>>
  requirements: {
    discoveries?: string[]
    buildings?: NewBuilding[]
  }
  maintenance: MaintenanceCost[]
  habitat: Habitat
  warehouse: Warehouse
  production: NewProduction[]
  expansion: Expansion[]
}

export type Building = NewBuilding & {
  cellId: string
}
