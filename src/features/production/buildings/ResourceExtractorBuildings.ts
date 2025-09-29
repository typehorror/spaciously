import { BuildingType, type Building } from "../types"
import {
  Ore,
  Gas,
  Crystals,
  Biomass,
  Plasma,
  Isotopes,
} from "../products/RawMaterial"

export interface ResourceExtractorBuilding extends Building {
  buildingType: BuildingType.RESOURCE_EXTRACTOR

  /**
   * The extraction efficiency of the building, expressed as a percentage (0 to 100).
   * Higher efficiency means faster resource extraction.
   */
  extractionEfficiency: number

  /**
   * The yield modifier for the extracted resource, expressed as a multiplier.
   * This affects the base production rate of the building.
   */
  yieldModifier: number
}

export const BasicMiner: ResourceExtractorBuilding = {
  level: 1,
  name: "Basic Miner",
  description:
    "A simple automated mining facility for extracting ore from the ground.",
  recipe: {
    inputs: [
      { product: "Ore", quantity: 3 },
      { product: "Crystals", quantity: 1 },
    ],
    energy: 1_000, // 1kWh to build
    buildTime: 10, // 10 seconds to build
  },
  buildingType: BuildingType.RESOURCE_EXTRACTOR,
  extractionEfficiency: 0.7,
  yieldModifier: 1.0,
  health: 100,
  maxHealth: 100,
  shield: 0,
  energyUsage: 30,
  isActive: true,
  storageCapacity: 50,
  production: [Ore],
  productionSpeedModifier: 0.0, // no speed bonus at basic level
}

export const AdvancedMiner: ResourceExtractorBuilding = {
  level: 1,
  name: "Advanced Miner",
  description:
    "An upgraded mining facility with enhanced extraction capabilities and ore processing.",
  recipe: {
    inputs: [
      { product: "Ore", quantity: 8 },
      { product: "Crystals", quantity: 4 },
      { product: "Gas", quantity: 2 },
    ],
    energy: 3_000, // 3kWh to build
    buildTime: 30, // 30 seconds to build
  },
  buildingType: BuildingType.RESOURCE_EXTRACTOR,
  extractionEfficiency: 0.85,
  yieldModifier: 1.5,
  health: 150,
  maxHealth: 150,
  shield: 0,
  energyUsage: 60,
  isActive: true,
  storageCapacity: 100,
  production: [Ore],
  productionSpeedModifier: 0.2, // 20% faster production
}

export const GasExtractor: ResourceExtractorBuilding = {
  level: 1,
  name: "Gas Extractor",
  description:
    "A specialized facility for extracting and purifying volatile gases from the atmosphere.",
  recipe: {
    inputs: [
      { product: "Ore", quantity: 5 },
      { product: "Crystals", quantity: 3 },
    ],
    energy: 1_200, // 1.2kWh to build
    buildTime: 12, // 12 seconds to build
  },
  buildingType: BuildingType.RESOURCE_EXTRACTOR,
  extractionEfficiency: 0.75,
  yieldModifier: 1.0,
  health: 80,
  maxHealth: 80,
  shield: 0,
  energyUsage: 40,
  isActive: true,
  storageCapacity: 75,
  production: [Gas],
  productionSpeedModifier: 0.0,
}

export const CrystalHarvester: ResourceExtractorBuilding = {
  level: 1,
  name: "Crystal Harvester",
  description:
    "A precision harvesting unit designed to extract rare crystals without damaging their structure.",
  recipe: {
    inputs: [
      { product: "Ore", quantity: 10 },
      { product: "Gas", quantity: 5 },
      { product: "Crystals", quantity: 2 },
    ],
    energy: 25_000, // 25kWh to build
    buildTime: 250, // 250 seconds to build
  },
  buildingType: BuildingType.RESOURCE_EXTRACTOR,
  extractionEfficiency: 0.6, // Lower efficiency due to delicate extraction process
  yieldModifier: 1.0,
  health: 120,
  maxHealth: 120,
  shield: 0,
  energyUsage: 80,
  isActive: true,
  storageCapacity: 30, // Smaller capacity for rare resources
  production: [Crystals],
  productionSpeedModifier: 0.0,
}

export const BiomassCollector: ResourceExtractorBuilding = {
  level: 1,
  name: "Biomass Collector",
  description:
    "An organic harvesting facility that collects and processes biological matter from the environment.",
  recipe: {
    inputs: [
      { product: "Ore", quantity: 4 },
      { product: "Crystals", quantity: 2 },
    ],
    energy: 900, // 0.9kWh to build
    buildTime: 90, // 90 seconds to build
  },
  buildingType: BuildingType.RESOURCE_EXTRACTOR,
  extractionEfficiency: 0.8,
  yieldModifier: 1.2, // Higher yield due to renewable nature
  health: 90,
  maxHealth: 90,
  shield: 0,
  energyUsage: 25,
  isActive: true,
  storageCapacity: 80,
  production: [Biomass],
  productionSpeedModifier: 0.1, // 10% faster production
}

export const PlasmaExtractor: ResourceExtractorBuilding = {
  level: 1,
  name: "Plasma Extractor",
  description:
    "A high-tech facility capable of generating and containing plasma from gas and crystal sources.",
  recipe: {
    inputs: [
      { product: "Ore", quantity: 15 },
      { product: "Gas", quantity: 8 },
      { product: "Crystals", quantity: 6 },
    ],
    energy: 40_000, // 40kWh to build
    buildTime: 400, // 400 seconds to build
  },
  buildingType: BuildingType.RESOURCE_EXTRACTOR,
  extractionEfficiency: 0.5, // Low efficiency due to complex process
  yieldModifier: 0.8,
  health: 180,
  maxHealth: 180,
  shield: 1,
  energyUsage: 120,
  isActive: true,
  storageCapacity: 25, // Very small capacity for dangerous material
  production: [Plasma],
  productionSpeedModifier: 0.0,
}

export const IsotopeRefinery: ResourceExtractorBuilding = {
  level: 1,
  name: "Isotope Refinery",
  description:
    "A specialized nuclear facility that processes ore and crystals to extract rare isotopes.",
  recipe: {
    inputs: [
      { product: "Ore", quantity: 20 },
      { product: "Crystals", quantity: 12 },
      { product: "Gas", quantity: 5 },
    ],
    energy: 60_000, // 60kWh to build
    buildTime: 500, // 500 seconds to build
  },
  buildingType: BuildingType.RESOURCE_EXTRACTOR,
  extractionEfficiency: 0.4, // Very low efficiency due to complex nuclear processes
  yieldModifier: 0.6,
  health: 200,
  maxHealth: 200,
  shield: 5, // Basic shielding due to radioactive materials
  energyUsage: 150,
  isActive: true,
  storageCapacity: 20, // Minimal capacity for highly radioactive material
  production: [Isotopes],
  productionSpeedModifier: 0.0,
}

export const resourceExtractorBuildings = [
  BasicMiner,
  AdvancedMiner,
  GasExtractor,
  CrystalHarvester,
  BiomassCollector,
  PlasmaExtractor,
  IsotopeRefinery,
]
