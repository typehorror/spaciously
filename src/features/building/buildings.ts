import { ResourceName, GeneratedResourceName } from "../resources/types"
import { type NewBuilding, ProductName } from "./types"

export const getColonyLander = (): NewBuilding => {
  const colonyLander: NewBuilding = {
    name: "colony lander",
    description:
      "the initial landing site transformed from the colonization ship, serving as a basic hub with limited capacities for population, storage, and production.",
    level: 1,
    cost: {
      [ResourceName.ORE]: 2000,
      [ResourceName.GAS]: 1000,
      [ResourceName.CRYSTALS]: 1000,
      [ResourceName.BIOMASS]: 5000,
      [ResourceName.PLASMA]: 500,
      [ResourceName.ISOTOPES]: 500,
    },
    requirements: {
      discoveries: [],
      buildings: [],
    },
    energy: {
      consumption: 1000,
      production: 5000,
    },
    maintenance: [
      {
        resource: ResourceName.BIOMASS,
        quantity: 1,
        period: 60000,
        multiplier: { [GeneratedResourceName.POPULATION]: 0.2 },
      },
      {
        resource: ResourceName.ORE,
        quantity: 1,
        period: 120000,
        multiplier: { level: 1 },
      },
    ],
    habitat: {
      population: 5,
      capacity: 20,
    },
    warehouse: {
      content: {
        [ProductName.AMMO]: 10,
      },
      capacity: 2 * 3 * 5, // 30 units
    },
    production: [
      {
        name: "Gas Production",
        resource: ResourceName.GAS,
        quantity: 1,
        period: 3000,
        cost: {},
        energyUsage: 1000, // 1kWh per production cycle
      },
      {
        name: "Population Growth",
        resource: GeneratedResourceName.POPULATION,
        quantity: 1,
        period: 60000,
        cost: { [ResourceName.BIOMASS]: 10 },
        energyUsage: 500, // 0.5kWh per production cycle
      },
      {
        name: "Ore Production",
        resource: ResourceName.ORE,
        quantity: 1,
        period: 2000, // 20 seconds
        cost: {},
        energyUsage: 1000, // 1kWh per production cycle
      },
    ],
    expansion: [
      {
        name: "Living Quarters",
        description:
          "Domed habitats rise from the rocky plains, shielding colonists from harsh winds and alien suns. Inside, life thrives — a heartbeat of civilization carved into an untamed world.",
        level: 2,
        cost: {
          [ResourceName.ORE]: 100,
          [ResourceName.BIOMASS]: 50,
        },
        modifier: {
          population: {
            capacity: 20,
          },
        },
      },
      {
        name: "Excavation Shaft",
        description:
          "Quantum drills and gravitic stabilizers carve deeper into planetary cores, unearthing rare ores untouched since the dawn of galaxies. Every shaft opened is a declaration that no world lies beyond humanity's grasp.",
        level: 2,
        cost: {
          [ResourceName.ORE]: 100,
          [ResourceName.BIOMASS]: 50,
        },
        modifier: {
          production: [
            {
              name: "Ore Production",
              resource: ResourceName.ORE,
              quantity: 2,
              period: 60000,
              cost: { [GeneratedResourceName.ENERGY]: 1 },
            },
          ],
        },
      },
      {
        name: "Compressor Unit",
        description:
          "Massive compressors roar across the barren terrain, drawing gas from deep beneath the planet's crust. Each pulse powers your outpost, turning the alien soil into a lifeline for your settlers.",
        level: 2,
        cost: {
          [ResourceName.ORE]: 40,
          [ResourceName.GAS]: 100,
          [ResourceName.BIOMASS]: 10,
        },
        modifier: {
          production: [
            {
              name: "Gas Production",
              resource: ResourceName.GAS,
              quantity: 2,
              cost: { [GeneratedResourceName.ENERGY]: 1 },
            },
          ],
        },
      },
      {
        name: "Solar Array Extension",
        description:
          "Expansive solar panels stretch across open fields, harvesting the planet's sun with unerring precision. Every watt captured fuels the colony's growth, a tangible spark of survival in an alien world.",
        level: 2,
        cost: {
          [ResourceName.ORE]: 100,
          [ResourceName.GAS]: 50,
        },
        modifier: {
          energy: {
            production: 7,
          },
        },
      },
    ],
  }
  return colonyLander
}
