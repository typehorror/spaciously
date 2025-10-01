import { BuildingType, type Building, type Product } from "../types"
import {
  BasicAmmo,
  ArmorPiercingAmmo,
  EnergyCell,
  PlasmaRound,
  ExplosiveShell,
  GuidedMissile,
  NuclearWarhead,
  ShieldCapacitor,
} from "../products/Ammunition"

export interface DefenseBuilding extends Building {
  buildingType: BuildingType.DEFENSE_SYSTEM

  /**
   * The accuracy of the defense building, expressed as a percentage (0 to 100).
   */
  accuracy: number

  /**
   * The range of the defense building in hexes.
   */
  range: number

  /**
   * The rate of fire of the defense building, expressed as shots per ticks.
   */
  rateOfFire: number

  /**
   * The types of ammunition this defense building can use.
   */
  compatibleAmmo: Product[]

  /**
   * The currently loaded ammunition type. If null, the building cannot fire.
   */
  currentAmmo: Product | null

  /**
   * The current ammunition count in the building's magazine.
   */
  ammoCount: number

  /**
   * The maximum ammunition capacity of the building.
   */
  maxAmmoCapacity: number

  /**
   * The damage multiplier when using the current ammunition type.
   */
  damageMultiplier: number
}

export const BasicTurret: DefenseBuilding = {
  level: 1,
  name: "Basic Turret",
  description: "A simple automated turret for defense against ground threats.",
  recipe: {
    inputs: [
      { product: "Ore", quantity: 5 },
      { product: "Crystals", quantity: 2 },
    ],
    energy: 1_000, // 1kWh to build
    buildTime: 15, // 15 seconds to build
  },
  buildingType: BuildingType.DEFENSE_SYSTEM,
  accuracy: 0.8,
  range: 1,
  rateOfFire: 1 / 5, // 1 shot every 5 ticks
  health: 100,
  maxHealth: 100,
  shield: 2,
  energyUsage: 50,
  isActive: true,
  storageCapacity: 0,
  compatibleAmmo: [BasicAmmo, ArmorPiercingAmmo],
  currentAmmo: BasicAmmo,
  ammoCount: 50,
  maxAmmoCapacity: 100,
  damageMultiplier: 1.0,
  production: [],
  productionSpeedModifier: 0.0,
  requiredResearch: ["ai-integration"],
}

export const AdvancedTurret: DefenseBuilding = {
  level: 1,
  name: "Advanced Turret",
  description: "A more powerful turret with enhanced targeting capabilities.",
  recipe: {
    inputs: [
      { product: "Ore", quantity: 10 },
      { product: "Crystals", quantity: 5 },
      { product: "Gas", quantity: 2 },
    ],
    energy: 3_000, // 3kWh to build
    buildTime: 30, // 30 seconds to build
  },
  buildingType: BuildingType.DEFENSE_SYSTEM,
  accuracy: 0.9,
  range: 2,
  rateOfFire: 1 / 3, // 1 shot every 3 ticks
  health: 150,
  maxHealth: 150,
  shield: 5,
  energyUsage: 100,
  isActive: true,
  storageCapacity: 0,
  compatibleAmmo: [BasicAmmo, ArmorPiercingAmmo, ExplosiveShell, GuidedMissile],
  currentAmmo: ArmorPiercingAmmo,
  ammoCount: 75,
  maxAmmoCapacity: 150,
  damageMultiplier: 1.5,
  production: [],
  productionSpeedModifier: 0.0,
  requiredResearch: ["defense-upgrades"],
}

export const ShieldGenerator: DefenseBuilding = {
  level: 1,
  name: "Shield Generator",
  description: "A defensive structure that generates a protective shield.",
  recipe: {
    inputs: [
      { product: "Ore", quantity: 15 },
      { product: "Crystals", quantity: 10 },
      { product: "Gas", quantity: 5 },
    ],
    energy: 1_500, // 1.5kWh to build
    buildTime: 45, // 45 seconds to build
  },
  buildingType: BuildingType.DEFENSE_SYSTEM,
  accuracy: 0.85,
  range: 3,
  rateOfFire: 1 / 4, // 1 shot every 4 ticks
  health: 200,
  maxHealth: 200,
  shield: 10,
  energyUsage: 150,
  isActive: true,
  storageCapacity: 0,
  compatibleAmmo: [EnergyCell, ShieldCapacitor],
  currentAmmo: EnergyCell,
  ammoCount: 25,
  maxAmmoCapacity: 50,
  damageMultiplier: 0.8, // Shield generators focus on defense, not damage
  production: [],
  productionSpeedModifier: 0.0,
  requiredResearch: ["shield-matrices"],
}

export const PlasmaCannon: DefenseBuilding = {
  level: 1,
  name: "Plasma Cannon",
  description:
    "A devastating energy weapon that fires superheated plasma projectiles at long range.",
  recipe: {
    inputs: [
      { product: "Ore", quantity: 25 },
      { product: "Crystals", quantity: 15 },
      { product: "Gas", quantity: 10 },
      { product: "Plasma", quantity: 2 },
    ],
    energy: 10_000, // 10kWh to build
    buildTime: 60, // 60 seconds to build
  },
  buildingType: BuildingType.DEFENSE_SYSTEM,
  accuracy: 0.75,
  range: 4,
  rateOfFire: 1 / 8, // 1 shot every 8 ticks (slower but more powerful)
  health: 180,
  maxHealth: 180,
  shield: 8,
  energyUsage: 200,
  isActive: true,
  storageCapacity: 0,
  compatibleAmmo: [PlasmaRound, EnergyCell],
  currentAmmo: PlasmaRound,
  ammoCount: 15,
  maxAmmoCapacity: 30,
  damageMultiplier: 3.0, // Very high damage
  production: [],
  productionSpeedModifier: 0.0,
  requiredResearch: ["advanced-weapons"],
}

export const NuclearSilo: DefenseBuilding = {
  level: 1,
  name: "Nuclear Silo",
  description:
    "The ultimate defensive structure capable of launching nuclear warheads at extreme range.",
  recipe: {
    inputs: [
      { product: "Ore", quantity: 50 },
      { product: "Crystals", quantity: 30 },
      { product: "Gas", quantity: 20 },
      { product: "Isotopes", quantity: 5 },
    ],
    energy: 50_000, // 50kWh to build
    buildTime: 100, // 100 seconds to build
  },
  buildingType: BuildingType.DEFENSE_SYSTEM,
  accuracy: 0.95, // Very high accuracy for strategic weapons
  range: 8, // Extreme range
  rateOfFire: 1 / 20, // 1 shot every 20 ticks (very slow reload)
  health: 300,
  maxHealth: 300,
  shield: 15,
  energyUsage: 500,
  isActive: true,
  storageCapacity: 0,
  compatibleAmmo: [NuclearWarhead, GuidedMissile],
  currentAmmo: null, // Starts without ammo due to rarity
  ammoCount: 0,
  maxAmmoCapacity: 5, // Very limited capacity for nuclear weapons
  damageMultiplier: 10.0, // Massive area damage
  production: [],
  productionSpeedModifier: 0.0,
  requiredResearch: ["advanced-weapons", "rare-material-prospecting"],
}

export const defenseBuildings = [
  BasicTurret,
  AdvancedTurret,
  ShieldGenerator,
  PlasmaCannon,
  NuclearSilo,
]
