import { type Product } from "../types"

export const Ore: Product = {
  name: "Ore",
  description:
    "A raw mineral resource used in various construction and manufacturing processes.",
  cost: {},
  ticksToBuild: 5,
}

export const Gas: Product = {
  name: "Gas",
  description:
    "A volatile resource used in energy production and advanced manufacturing.",
  cost: {},
  ticksToBuild: 8,
}

export const Crystals: Product = {
  name: "Crystals",
  description:
    "A rare mineral resource used in high-tech applications and energy storage.",
  cost: {},
  ticksToBuild: 15,
}

export const Biomass: Product = {
  name: "Biomass",
  description:
    "Organic material used for energy production and life support systems.",
  cost: {},
  ticksToBuild: 10,
}

export const Plasma: Product = {
  name: "Plasma",
  description:
    "A highly energetic state of matter used in advanced weaponry and propulsion systems.",
  cost: { Gas: 2, Crystals: 1 },
  ticksToBuild: 20,
}

export const Isotopes: Product = {
  name: "Isotopes",
  description:
    "Variants of elements with different neutron counts, used in nuclear applications and advanced research.",
  cost: { Ore: 2, Crystals: 2 },
  ticksToBuild: 25,
}
