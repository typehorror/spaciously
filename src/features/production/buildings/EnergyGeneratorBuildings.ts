import { BuildingType, type Building } from "../types"

export interface EnergyGeneratorBuilding extends Building {
  buildingType: BuildingType.POWER_GENERATOR

  /**
   * The power generation efficiency of the building, expressed as a percentage (0 to 100).
   * Higher efficiency means more stable power output and better fuel utilization.
   */
  generationEfficiency: number

  /**
   * The power output modifier for the generator, expressed as a multiplier.
   * This affects the base power generation rate of the building.
   */
  powerOutputModifier: number
}

export const BasicGenerator: EnergyGeneratorBuilding = {
  level: 1,
  name: "Basic Generator",
  description:
    "A simple combustion generator that burns biomass to produce basic electrical power.",
  recipe: {
    inputs: [
      { product: "Ore", quantity: 4 },
      { product: "Biomass", quantity: 2 },
    ],
    energy: 800, // 0.8kWh to build
    buildTime: 15, // 15 seconds to build
  },
  buildingType: BuildingType.POWER_GENERATOR,
  generationEfficiency: 0.65,
  powerOutputModifier: 1.0,
  health: 100,
  maxHealth: 100,
  shield: 0,
  energyUsage: -500, // Produces 500 Wh
  isActive: true,
  storageCapacity: 0,
  production: [],
  productionSpeedModifier: 0.0,
  requiredResearch: [],
}

export const SolarArray: EnergyGeneratorBuilding = {
  level: 1,
  name: "Solar Array",
  description:
    "An array of photovoltaic panels that convert sunlight into clean electrical energy.",
  recipe: {
    inputs: [
      { product: "Ore", quantity: 6 },
      { product: "Crystals", quantity: 4 },
    ],
    energy: 1_500, // 1.5kWh to build
    buildTime: 25, // 25 seconds to build
  },
  buildingType: BuildingType.POWER_GENERATOR,
  generationEfficiency: 0.8,
  powerOutputModifier: 1.2,
  health: 80,
  maxHealth: 80,
  shield: 0,
  energyUsage: -760, // Produces 760 Wh
  isActive: true,
  storageCapacity: 0,
  production: [],
  productionSpeedModifier: 0.0,
  requiredResearch: ["energy-generation"],
}

export const GasTurbine: EnergyGeneratorBuilding = {
  level: 1,
  name: "Gas Turbine",
  description:
    "A high-efficiency turbine generator that burns processed gases for reliable power output.",
  recipe: {
    inputs: [
      { product: "Ore", quantity: 10 },
      { product: "Gas", quantity: 6 },
      { product: "Crystals", quantity: 3 },
    ],
    energy: 2_500, // 2.5kWh to build
    buildTime: 40, // 40 seconds to build
  },
  buildingType: BuildingType.POWER_GENERATOR,
  generationEfficiency: 0.85,
  powerOutputModifier: 1.5,
  health: 120,
  maxHealth: 120,
  shield: 0,
  energyUsage: -1200, // Produces 1200 Wh
  isActive: true,
  storageCapacity: 0,
  production: [],
  productionSpeedModifier: 0.0,
  requiredResearch: ["efficient-grids"],
}

export const GeothermalPlant: EnergyGeneratorBuilding = {
  level: 1,
  name: "Geothermal Plant",
  description:
    "A deep-core energy extraction facility that harnesses planetary heat for continuous power generation.",
  recipe: {
    inputs: [
      { product: "Ore", quantity: 15 },
      { product: "Crystals", quantity: 8 },
      { product: "Gas", quantity: 5 },
    ],
    energy: 8_000, // 8kWh to build
    buildTime: 80, // 80 seconds to build
  },
  buildingType: BuildingType.POWER_GENERATOR,
  generationEfficiency: 0.9,
  powerOutputModifier: 2.0,
  health: 200,
  maxHealth: 200,
  shield: 1,
  energyUsage: -2_000, // Produces 2000 Wh
  isActive: true,
  storageCapacity: 0,
  production: [],
  productionSpeedModifier: 0.0,
  requiredResearch: ["renewable-sources"],
}

export const FusionReactor: EnergyGeneratorBuilding = {
  level: 1,
  name: "Fusion Reactor",
  description:
    "An advanced fusion power plant that combines plasma and gas to generate massive amounts of clean energy.",
  recipe: {
    inputs: [
      { product: "Ore", quantity: 25 },
      { product: "Crystals", quantity: 15 },
      { product: "Gas", quantity: 12 },
      { product: "Plasma", quantity: 3 },
    ],
    energy: 20_000, // 20kWh to build
    buildTime: 200, // 200 seconds to build
  },
  buildingType: BuildingType.POWER_GENERATOR,
  generationEfficiency: 0.95,
  powerOutputModifier: 3.0,
  health: 300,
  maxHealth: 300,
  shield: 5,
  energyUsage: -5_000, // Produces 5000 Wh
  isActive: true,
  storageCapacity: 0,
  production: [],
  productionSpeedModifier: 0.0,
  requiredResearch: ["plasma-harnessing"],
}

export const QuantumGenerator: EnergyGeneratorBuilding = {
  level: 1,
  name: "Quantum Generator",
  description:
    "A cutting-edge quantum energy converter that manipulates isotopes at the subatomic level for incredible power output.",
  recipe: {
    inputs: [
      { product: "Ore", quantity: 40 },
      { product: "Crystals", quantity: 25 },
      { product: "Plasma", quantity: 8 },
      { product: "Isotopes", quantity: 5 },
    ],
    energy: 50_000, // 50kWh to build
    buildTime: 400, // 400 seconds to build
  },
  buildingType: BuildingType.POWER_GENERATOR,
  generationEfficiency: 0.98,
  powerOutputModifier: 5.0,
  health: 250,
  maxHealth: 250,
  shield: 10,
  energyUsage: -12_000, // Produces 12000 Wh
  isActive: true,
  storageCapacity: 0,
  production: [],
  productionSpeedModifier: 0.0,
  requiredResearch: ["fusion-cores"],
}

export const DysonCollector: EnergyGeneratorBuilding = {
  level: 1,
  name: "Dyson Collector",
  description:
    "A miniaturized stellar energy collector that captures and converts star radiation into virtually limitless power.",
  recipe: {
    inputs: [
      { product: "Ore", quantity: 80 },
      { product: "Crystals", quantity: 60 },
      { product: "Plasma", quantity: 20 },
      { product: "Isotopes", quantity: 15 },
    ],
    energy: 150_000, // 150kWh to build
    buildTime: 800, // 800 seconds to build
  },
  buildingType: BuildingType.POWER_GENERATOR,
  generationEfficiency: 0.99,
  powerOutputModifier: 10.0,
  health: 400,
  maxHealth: 400,
  shield: 20,
  energyUsage: -30_000, // Produces 30000 Wh
  isActive: true,
  storageCapacity: 0,
  production: [],
  productionSpeedModifier: 0.0,
  requiredResearch: ["dyson-arrays"],
}

export const energyGeneratorBuildings = [
  BasicGenerator,
  SolarArray,
  GasTurbine,
  GeothermalPlant,
  FusionReactor,
  QuantumGenerator,
  DysonCollector,
]
