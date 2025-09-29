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

export interface ProductRecipe {
  /**
   * The input resources required to produce the product.
   */
  inputs: Array<{ product: string; quantity: number }>

  /**
   * The energy cost in Watt hours (Wh) to produce the product.
   */
  energy: number

  /**
   * The base time it takes to build the product in seconds.
   * This time can be modified by various factors such as
   * building level, discoveries, and other game mechanics.
   */
  buildTime: number
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
   * The energy consumption in Watt hours (Wh) for producing the product.
   */
  recipe: ProductRecipe
}

/**
 * A building represents a structure that can be constructed and
 * placed on a slot within a cell (hex) on a planet.
 */
export interface Building extends Product {
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
   * and wear and tear over time. The cost of maintenance is 50% of the
   * building cost unless another unit or discovery provides a modifier.
   */
  health: number

  /**
   * The maximum health of the building.
   * When health reaches 0, the building is considered destroyed.
   */
  maxHealth: number

  /**
   * The shield damps incoming damage before it affects health.
   */
  shield: number

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

  /**
   * The list of products that can be produced by the building.
   */
  production: Product[]

  /**
   * percentage modifier to production speed (e.g., 0.1 for +10% speed)
   */
  productionSpeedModifier: number
}
