import { BuildingType, type Building } from "../types"

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
}

export const BasicTurret: DefenseBuilding = {
  id: "", // to be set when instantiated
  level: 1,
  name: "Basic Turret",
  description: "A simple automated turret for defense against ground threats.",
  cost: { Ore: 5, Crystals: 2 },
  ticksToBuild: 150, // about 15 seconds if 1 tick = 100ms
  buildingType: BuildingType.DEFENSE_SYSTEM,
  accuracy: 0.8,
  range: 1,
  rateOfFire: 1 / 5, // 1 shot every 5 ticks
  health: 100,
  energyUsage: 50,
  isActive: true,
  storageCapacity: 0,
}

export const AdvancedTurret: DefenseBuilding = {
  id: "", // to be set when instantiated
  level: 1,
  name: "Advanced Turret",
  description: "A more powerful turret with enhanced targeting capabilities.",
  cost: { Ore: 10, Crystals: 5, Gas: 2 },
  ticksToBuild: 300, // about 30 seconds if 1 tick = 100ms
  buildingType: BuildingType.DEFENSE_SYSTEM,
  accuracy: 0.9,
  range: 2,
  rateOfFire: 1 / 3, // 1 shot every 3 ticks
  health: 150,
  energyUsage: 100,
  isActive: true,
  storageCapacity: 0,
}

export const ShieldGenerator: DefenseBuilding = {
  id: "", // to be set when instantiated
  level: 1,
  name: "Shield Generator",
  description: "A defensive structure that generates a protective shield.",
  cost: { Ore: 15, Crystals: 10, Gas: 5 },
  ticksToBuild: 450, // about 45 seconds if 1 tick = 100ms
  buildingType: BuildingType.DEFENSE_SYSTEM,
  accuracy: 0.85,
  range: 3,
  rateOfFire: 1 / 4, // 1 shot every 4 ticks
  health: 200,
  energyUsage: 150,
  isActive: true,
  storageCapacity: 0,
}
