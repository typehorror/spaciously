import { type AllResourceNames } from "../resources/types"

export type NewProduction = {
  name: string
  resource: AllResourceNames
  quantity: number
  period: number // the time it takes to produce the resource in ms
  cost?: Partial<Record<AllResourceNames, number>>
  energyUsage: number // energy used per production cycle in Wh
}

export type Production = NewProduction & {
  cellId: string
  id: string
  lastProductionTime: number
}

/*
 * Ideas for building types:
 * - Factory
 * - Housing
 * - Research
 * - Farming
 * - Mining
 * - Power Generation
 * - Storage
 * - Transportation -> interconnect hex with its surroundings
 * - Maintenance
 * - Recreation
 * - Medical
 * - Communication
 * - Defense
 * - Ship yard
 * - Refinery
 * - Laboratory
 * - Command Center
 * - Marketplace
 */

export enum BuildingType {
  /**
   * Population growth/capacity (absorbs Recreation/Medical for morale/health bonuses via upgrades/combos)
   */
  HABITAT_MODULE = "Habitat Module",
  RESOURCE_EXTRACTOR = "Resource Extractor", // Yield: Raw resources (configurable per hex type; stacks for efficiency)
  FARMING_POD = "Farming Pod", // Yield: Biomass-specific (ties into sustainability; combos for food/energy)
  REFINERY = "Refinery", // Yield: Refined resources (e.g., Alloys from Ore/Gas; requires inputs)
  FACTORY = "Factory", // Yield: Products/Ammo (assembly-focused; combos unlock advanced items)
  POWER_GENERATOR = "Power Generator", // Yield: Energy production (stacks for grid scaling)
  STORAGE_DEPOT = "Storage Depot", // Yield: Capacity buffs (no direct output, but enables hoarding/combos for logistics)
  CONDUIT_NETWORK = "Conduit Network", // Yield: Inter-hex connectivity (bonuses to adjacent yields; e.g., resource sharing)
  MAINTENANCE_BAY = "Maintenance Bay", // Yield: Reduced costs/repairs (applies hex-wide; combos for auto-upgrades)
  RESEARCH_LAB = "Research Lab", // Yield: Discovery points (unlocks combos/slots; stacks for faster tech)
  DEFENSE_SYSTEM = "Defense System", // Yield: Readiness points (pirate resistance; range-based combos)
  COMMAND_CENTER = "Command Center", // Yield: Oversight bonuses (e.g., yield multipliers hex-wide; central hub role)
  MARKETPLACE = "Marketplace", // Yield: Trade rates (AI vendors now; future multiplayer hooks)
  SHIPYARD = "Shipyard", // Yield: Ship production (for expansion; high-energy combos)
}

export interface Product {
  /**
   * The name of the product (e.g., "Ore", "Missile", etc.)
   */
  name: string

  /**
   * The human-readable description of the product, keep it creative!
   */
  description: string

  /**
   * The resource cost to build the product.
   */
  cost: Partial<Record<AllResourceNames, number>>

  /**
   * The base time it takes to build the product in game ticks.
   * This time can be modified by various factors such as
   * building level, discoveries, and other game mechanics.
   */
  ticksToBuild: number
}

/**
 * This is to be extended by building that have factory capabilities.
 */
export interface ProducerBuilding {
  /**
   * The list of products that can be produced by the building.
   */
  products: Product[]

  /**
   * percentage modifier to production speed (e.g., 0.1 for +10% speed)
   */
  productionSpeedModifier: number
}

/**
 * A building placement represents a building placed on a specific cell (hex) on the planet.
 */
export interface BuildingPlacement {
  /**
   * The ID of the cell (Hex) where the building is placed.
   */
  cellId: string

  /**
   * The slot ID where the building is placed (0-n a hex can have multiple slots).
   */
  slotId: number

  /**
   * The ID of the building placed in the cell.
   */
  buildingId: string
}

/**
 * A building represents a structure that can be constructed and
 * placed on a slot within a cell (hex) on a planet.
 */
export interface Building extends Product {
  /**
   * The unique identifier for the building instance.
   */
  id: string

  /**
   * The type of the building for categorization and type-specific logic.
   */
  buildingType: BuildingType

  /**
   * The name of the building (e.g., "Colony Lander", "Solar Panel", etc.)
   */
  name: string

  /**
   * The human-readable description of the building, keep it creative!
   */
  description: string

  /**
   * The level of the building, dictates its capabilities, efficiencies
   * power consumption, and maintenance costs.
   */
  level: number

  /**
   * Buildings can take damage from various sources such as attacks,
   * and wear and tear over time. The health attribute is expressed
   * as a percentage (0 to 100). The cost of maintenance is 50% of the
   * building cost unless another unit or discovery provides a modifier.
   */
  health: number

  /**
   * The energy consumption in Wh for the building when in use (isActive is true).
   */
  energyUsage: number

  /**
   * Is the building currently active? (e.g., producing resources, providing services, etc.)
   */
  isActive: boolean

  /**
   * The maximum number of units the building can store. This storage capacity is directly
   * added to the hex's total storage capacity.
   */
  storageCapacity: number
}
