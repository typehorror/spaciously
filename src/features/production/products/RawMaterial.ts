import { type Product } from "../types"

export const Ore: Product = {
  name: "Ore",
  description:
    "A raw mineral resource used in various construction and manufacturing processes.",
  recipe: { inputs: [], energy: 200, buildTime: 5 },
}

export const Gas: Product = {
  name: "Gas",
  description:
    "A volatile resource used in energy production and advanced manufacturing.",
  recipe: { inputs: [], energy: 400, buildTime: 8 },
}

export const Crystals: Product = {
  name: "Crystals",
  description:
    "A rare mineral resource used in high-tech applications and energy storage.",
  recipe: { inputs: [], energy: 1_000, buildTime: 15 },
}

export const Biomass: Product = {
  name: "Biomass",
  description:
    "Organic material used for energy production and life support systems.",
  recipe: { inputs: [], energy: 200, buildTime: 60 },
}

export const Plasma: Product = {
  name: "Plasma",
  description:
    "A highly energetic state of matter used in advanced weaponry and propulsion systems.",
  recipe: {
    inputs: [{ product: "Gas", quantity: 5 }],
    energy: 1_000, // 1kWh to produce
    buildTime: 20,
  },
}

export const Isotopes: Product = {
  name: "Isotopes",
  description:
    "Variants of elements with different neutron counts, used in nuclear applications and advanced research.",
  recipe: {
    inputs: [
      { product: "Ore", quantity: 2 },
      { product: "Crystals", quantity: 1 },
    ],
    energy: 2_000, // 2kWh to produce
    buildTime: 25,
  },
}

export const rawMaterials = [Ore, Gas, Crystals, Biomass, Plasma, Isotopes]
