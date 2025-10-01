import { defenseBuildings } from "./DefenseBuildings"
import { resourceExtractorBuildings } from "./ResourceExtractorBuildings"
import { energyGeneratorBuildings } from "./EnergyGeneratorBuildings"

export const allBuildings = [
  ...resourceExtractorBuildings,
  ...defenseBuildings,
  ...energyGeneratorBuildings,
]
