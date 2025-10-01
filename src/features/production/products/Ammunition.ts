import { type Product } from "../types"

export const BasicAmmo: Product = {
  name: "BasicAmmo",
  description: "A standard ammunition type suitable for most firearms.",
  recipe: {
    inputs: [{ product: "Ore", quantity: 2 }],
    energy: 0,
    buildTime: 25, // 25 seconds to produce
  },
}

export const EnergyCell: Product = {
  name: "EnergyCell",
  description:
    "A rechargeable power cell used in various energy systems and devices.",
  recipe: {
    inputs: [{ product: "Gas", quantity: 2 }],
    energy: 0,
    buildTime: 30, // 30 seconds to produce
  },
}
export const ArmorPiercingAmmo: Product = {
  name: "ArmorPiercingAmmo",
  description: "Ammunition designed to penetrate armored targets effectively.",
  recipe: {
    inputs: [
      { product: "Ore", quantity: 5 },
      { product: "Crystals", quantity: 2 },
    ],
    energy: 0,
    buildTime: 45, // 45 seconds to produce
  },
}

export const PlasmaRound: Product = {
  name: "PlasmaRound",
  description:
    "A high-energy projectile that delivers devastating plasma damage.",
  recipe: {
    inputs: [
      { product: "Gas", quantity: 5 },
      { product: "Plasma", quantity: 2 },
    ],
    energy: 0,
    buildTime: 60, // 60 seconds to produce
  },
}

export const ExplosiveShell: Product = {
  name: "ExplosiveShell",
  description:
    "A shell filled with explosives, designed to cause area damage upon impact.",
  recipe: {
    inputs: [
      { product: "Ore", quantity: 3 },
      { product: "Gas", quantity: 3 },
      { product: "Crystals", quantity: 1 },
    ],
    energy: 0,
    buildTime: 75, // 75 seconds to produce
  },
}

export const GuidedMissile: Product = {
  name: "GuidedMissile",
  description:
    "A missile equipped with guidance systems for improved accuracy.",
  recipe: {
    inputs: [
      { product: "Ore", quantity: 10 },
      { product: "Gas", quantity: 5 },
      { product: "Crystals", quantity: 5 },
      { product: "Plasma", quantity: 2 },
    ],
    energy: 0,
    buildTime: 120, // 120 seconds to produce
  },
}

export const NuclearWarhead: Product = {
  name: "NuclearWarhead",
  description:
    "A powerful warhead designed for maximum destruction, utilizing nuclear fusion.",
  recipe: {
    inputs: [
      { product: "Ore", quantity: 20 },
      { product: "Plasma", quantity: 10 },
      { product: "Isotopes", quantity: 10 },
    ],
    energy: 0,
    buildTime: 180, // 180 seconds to produce
  },
}

export const ShieldCapacitor: Product = {
  name: "ShieldCapacitor",
  description:
    "A device that stores and releases energy to reinforce shields during combat.",
  recipe: {
    inputs: [
      { product: "Crystals", quantity: 10 },
      { product: "Plasma", quantity: 5 },
      { product: "Isotopes", quantity: 5 },
    ],
    energy: 0,
    buildTime: 150, // 150 seconds to produce
  },
}

export const ammunition = [
  BasicAmmo,
  EnergyCell,
  ArmorPiercingAmmo,
  PlasmaRound,
  ExplosiveShell,
  GuidedMissile,
  NuclearWarhead,
  ShieldCapacitor,
]
