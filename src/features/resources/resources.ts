import { ResourceName } from "../resources/types"

export const resourceOddDistribution = {
  [ResourceName.ORE]: 0.7,
  [ResourceName.GAS]: 0.5,
  [ResourceName.CRYSTALS]: 0.3,
  [ResourceName.BIOMASS]: 0.5,
  [ResourceName.PLASMA]: 0.1,
  [ResourceName.ISOTOPES]: 0.05,
}

export const resourceColor = {
  [ResourceName.ORE]: "border-orange-500/60 bg-orange-500/30",
  [ResourceName.GAS]: "border-blue-500/60 bg-blue-500/30",
  [ResourceName.CRYSTALS]: "border-purple-500/60 bg-purple-500/30",
  [ResourceName.BIOMASS]: "border-green-500/60 bg-green-500/30",
  [ResourceName.PLASMA]: "border-red-500/60 bg-red-500/30",
  [ResourceName.ISOTOPES]: "border-yellow-500/60 bg-yellow-500/30",
}

export const backgroundColor = {
  [ResourceName.ORE]: "bg-orange-400",
  [ResourceName.GAS]: "bg-blue-400",
  [ResourceName.CRYSTALS]: "bg-purple-400",
  [ResourceName.BIOMASS]: "bg-green-400",
  [ResourceName.PLASMA]: "bg-red-400",
  [ResourceName.ISOTOPES]: "bg-yellow-400",
}

export const borderColor = {
  [ResourceName.ORE]: "border-orange-400",
  [ResourceName.GAS]: "border-blue-400",
  [ResourceName.CRYSTALS]: "border-purple-400",
  [ResourceName.BIOMASS]: "border-green-400",
  [ResourceName.PLASMA]: "border-red-400",
  [ResourceName.ISOTOPES]: "border-yellow-400",
}

export const resourceNames = Object.values(ResourceName)

/**
 * Randomize resource distribution for a cell based on
 * predefined odds.
 * @returns An object representing the distributed resources.
 */
export function distributeResources(): Record<ResourceName, number> {
  const resources = {
    [ResourceName.ORE]: 0,
    [ResourceName.GAS]: 0,
    [ResourceName.CRYSTALS]: 0,
    [ResourceName.BIOMASS]: 0,
    [ResourceName.PLASMA]: 0,
    [ResourceName.ISOTOPES]: 0,
  }

  let total = 0

  while (total <= 10) {
    for (const res of resourceNames) {
      if (Math.random() < resourceOddDistribution[res]) {
        resources[res] += 1
        total += 1

        if (total >= 10) {
          return resources
        }
      }
    }
  }

  return resources
}
