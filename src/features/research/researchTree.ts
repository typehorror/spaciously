import { type Research } from "./types" // Assuming the type is imported from your file

export const researchTree: Research[] = [
  // Tier 1: Foundations - Starting researches, no prerequisites
  {
    id: "resource-extraction",
    name: "Resource Extraction",
    description: "Unlocks basic extractors for Ore, Gas, and Biomass.",
    researched: false,
    prerequisites: [],
    recipe: {
      inputs: [
        { product: "Ore", quantity: 5 },
        { product: "Biomass", quantity: 3 },
      ],
      energy: 1_000, // 1kWh to research
      buildTime: 300, // 5 minutes to research
    },
  },
  {
    id: "habitation-basics",
    name: "Habitation Basics",
    description: "Unlocks basic habitation modules for population growth.",
    researched: false,
    prerequisites: [],
    recipe: {
      inputs: [
        { product: "Ore", quantity: 4 },
        { product: "Biomass", quantity: 2 },
      ],
      energy: 1_000, // 1kWh to research
      buildTime: 300, // 5 minutes to research
    },
  },
  {
    id: "energy-generation",
    name: "Energy Generation",
    description: "Unlocks simple power plants for energy production.",
    researched: false,
    prerequisites: [],
    recipe: {
      inputs: [],
      energy: 1_000, // 1kWh to research
      buildTime: 300, // 5 minutes to research
    },
  },

  // Tier 2: Early Growth - Builds on foundations
  {
    id: "basic-refining",
    name: "Basic Refining",
    description: "Unlocks refineries for processing Ore into Refined Ore.",
    researched: false,
    prerequisites: ["resource-extraction"],
    recipe: {
      inputs: [
        { product: "Ore", quantity: 8 },
        { product: "Biomass", quantity: 5 },
      ],
      energy: 2_000, // 2kWh to research
      buildTime: 600, // 10 minutes to research
    },
  },
  {
    id: "life-support-systems",
    name: "Life Support Systems",
    description:
      "Enables habitation in harsh environments and unlocks Synthetics.",
    researched: false,
    prerequisites: ["habitation-basics"],
    recipe: {
      inputs: [
        { product: "Ore", quantity: 6 },
        { product: "Biomass", quantity: 8 },
        { product: "Gas", quantity: 4 },
      ],
      energy: 2_500, // 2.5kWh to research
      buildTime: 720, // 12 minutes to research
    },
  },
  {
    id: "efficient-grids",
    name: "Efficient Grids",
    description: "Improves energy distribution with wireless grids.",
    researched: false,
    prerequisites: ["energy-generation"],
    recipe: {
      inputs: [
        { product: "Ore", quantity: 7 },
        { product: "Gas", quantity: 5 },
      ],
      energy: 2_000, // 2kWh to research
      buildTime: 600, // 10 minutes to research
    },
  },
  {
    id: "terrain-analysis",
    name: "Terrain Analysis",
    description: "Reveals hidden hex stats and unlocks Scout Drones.",
    researched: false,
    prerequisites: ["resource-extraction"],
    recipe: {
      inputs: [
        { product: "Ore", quantity: 5 },
        { product: "Gas", quantity: 3 },
        { product: "Biomass", quantity: 4 },
      ],
      energy: 1_800, // 1.8kWh to research
      buildTime: 540, // 9 minutes to research
    },
  },
  {
    id: "population-incentives",
    name: "Population Incentives",
    description: "Boosts population growth through morale events.",
    researched: false,
    prerequisites: ["habitation-basics"],
    recipe: {
      inputs: [
        { product: "Biomass", quantity: 10 },
        { product: "Ore", quantity: 3 },
      ],
      energy: 1_500, // 1.5kWh to research
      buildTime: 480, // 8 minutes to research
    },
  },
  {
    id: "renewable-sources",
    name: "Renewable Sources",
    description: "Unlocks Biomass-to-Energy conversion.",
    researched: false,
    prerequisites: ["energy-generation"],
    recipe: {
      inputs: [
        { product: "Biomass", quantity: 8 },
        { product: "Gas", quantity: 4 },
      ],
      energy: 2_200, // 2.2kWh to research
      buildTime: 660, // 11 minutes to research
    },
  },

  // Resource Unlocks - Phased introduction of new raw resources
  {
    id: "resource-diversification",
    name: "Resource Diversification",
    description: "Unlocks extraction of Crystals.",
    researched: false,
    prerequisites: ["resource-extraction", "terrain-analysis"],
    recipe: {
      inputs: [
        { product: "Ore", quantity: 12 },
        { product: "Gas", quantity: 8 },
        { product: "Biomass", quantity: 6 },
      ],
      energy: 3_500, // 3.5kWh to research
      buildTime: 900, // 15 minutes to research
    },
  },
  {
    id: "energy-expansion",
    name: "Energy Expansion",
    description: "Unlocks extraction of Plasma.",
    researched: false,
    prerequisites: ["efficient-grids", "renewable-sources"],
    recipe: {
      inputs: [
        { product: "Gas", quantity: 15 },
        { product: "Ore", quantity: 10 },
        { product: "Biomass", quantity: 8 },
      ],
      energy: 4_000, // 4kWh to research
      buildTime: 1080, // 18 minutes to research
    },
  },
  {
    id: "rare-material-prospecting",
    name: "Rare Material Prospecting",
    description: "Unlocks extraction of Isotopes.",
    researched: false,
    prerequisites: ["resource-diversification", "energy-expansion"],
    recipe: {
      inputs: [
        { product: "Crystals", quantity: 5 },
        { product: "Ore", quantity: 15 },
        { product: "Gas", quantity: 12 },
      ],
      energy: 5_500, // 5.5kWh to research
      buildTime: 1320, // 22 minutes to research
    },
  },

  // Tier 3: Intermediate Expansion - More products and buildings
  {
    id: "alloy-forging",
    name: "Alloy Forging",
    description: "Unlocks Alloys from Refined Ore and Crystals.",
    researched: false,
    prerequisites: ["basic-refining", "resource-diversification"],
    recipe: {
      inputs: [
        { product: "Ore", quantity: 20 },
        { product: "Crystals", quantity: 8 },
        { product: "Gas", quantity: 10 },
      ],
      energy: 6_000, // 6kWh to research
      buildTime: 1500, // 25 minutes to research
    },
  },
  {
    id: "machinery-assembly",
    name: "Machinery Assembly",
    description: "Unlocks Machinery from Alloys and Gas.",
    researched: false,
    prerequisites: ["alloy-forging"],
    recipe: {
      inputs: [
        { product: "Ore", quantity: 25 },
        { product: "Crystals", quantity: 10 },
        { product: "Gas", quantity: 15 },
        { product: "Biomass", quantity: 8 },
      ],
      energy: 7_500, // 7.5kWh to research
      buildTime: 1800, // 30 minutes to research
    },
  },
  {
    id: "bio-engineering",
    name: "Bio-Engineering",
    description: "Unlocks advanced Hab Domes and Bio-Enhancers.",
    researched: false,
    prerequisites: ["life-support-systems"],
    recipe: {
      inputs: [
        { product: "Biomass", quantity: 20 },
        { product: "Crystals", quantity: 6 },
        { product: "Gas", quantity: 12 },
      ],
      energy: 5_500, // 5.5kWh to research
      buildTime: 1320, // 22 minutes to research
    },
  },
  {
    id: "plasma-harnessing",
    name: "Plasma Harnessing",
    description: "Upgrades power plants to Fusion Reactors.",
    researched: false,
    prerequisites: ["energy-expansion"],
    recipe: {
      inputs: [
        { product: "Plasma", quantity: 3 },
        { product: "Gas", quantity: 18 },
        { product: "Crystals", quantity: 8 },
      ],
      energy: 8_000, // 8kWh to research
      buildTime: 2100, // 35 minutes to research
    },
  },
  {
    id: "colonization-tech",
    name: "Colonization Tech",
    description: "Unlocks basic Colonization Ships.",
    researched: false,
    prerequisites: ["terrain-analysis", "machinery-assembly"],
    recipe: {
      inputs: [
        { product: "Ore", quantity: 30 },
        { product: "Crystals", quantity: 12 },
        { product: "Gas", quantity: 20 },
        { product: "Biomass", quantity: 15 },
      ],
      energy: 9_000, // 9kWh to research
      buildTime: 2400, // 40 minutes to research
    },
  },
  {
    id: "ai-integration",
    name: "AI Integration",
    description: "Unlocks smart buildings and Defense Outposts.",
    researched: false,
    prerequisites: ["population-incentives", "machinery-assembly"],
    recipe: {
      inputs: [
        { product: "Crystals", quantity: 15 },
        { product: "Ore", quantity: 22 },
        { product: "Gas", quantity: 18 },
      ],
      energy: 8_500, // 8.5kWh to research
      buildTime: 2250, // 37.5 minutes to research
    },
  },
  {
    id: "ecology-mastery",
    name: "Ecology Mastery",
    description: "Boosts yields through terraforming.",
    researched: false,
    prerequisites: ["renewable-sources", "bio-engineering"],
    recipe: {
      inputs: [
        { product: "Biomass", quantity: 25 },
        { product: "Crystals", quantity: 8 },
        { product: "Gas", quantity: 15 },
      ],
      energy: 7_000, // 7kWh to research
      buildTime: 1950, // 32.5 minutes to research
    },
  },
  {
    id: "electronics-fabrication",
    name: "Electronics Fabrication",
    description: "Unlocks Electronics from Crystals and Ore.",
    researched: false,
    prerequisites: ["resource-diversification", "basic-refining"],
    recipe: {
      inputs: [
        { product: "Crystals", quantity: 18 },
        { product: "Ore", quantity: 25 },
        { product: "Gas", quantity: 10 },
      ],
      energy: 6_500, // 6.5kWh to research
      buildTime: 1650, // 27.5 minutes to research
    },
  },
  {
    id: "fuel-cell-production",
    name: "Fuel Cell Production",
    description: "Unlocks Fuel Cells from Gas and Isotopes.",
    researched: false,
    prerequisites: ["rare-material-prospecting", "efficient-grids"],
    recipe: {
      inputs: [
        { product: "Isotopes", quantity: 4 },
        { product: "Gas", quantity: 22 },
        { product: "Crystals", quantity: 10 },
      ],
      energy: 10_000, // 10kWh to research
      buildTime: 2700, // 45 minutes to research
    },
  },

  // Tier 4: Advanced Optimization - Deeper products and upgrades
  {
    id: "nano-alloys",
    name: "Nano-Alloys",
    description: "Unlocks Nano-Alloys from Alloys and Electronics.",
    researched: false,
    prerequisites: ["alloy-forging", "electronics-fabrication"],
    recipe: {
      inputs: [
        { product: "Crystals", quantity: 25 },
        { product: "Ore", quantity: 40 },
        { product: "Gas", quantity: 30 },
        { product: "Isotopes", quantity: 6 },
      ],
      energy: 15_000, // 15kWh to research
      buildTime: 3600, // 60 minutes to research
    },
  },
  {
    id: "automated-drones",
    name: "Automated Drones",
    description: "Unlocks drone swarms for automation.",
    researched: false,
    prerequisites: ["machinery-assembly", "ai-integration"],
    recipe: {
      inputs: [
        { product: "Crystals", quantity: 30 },
        { product: "Ore", quantity: 35 },
        { product: "Gas", quantity: 25 },
        { product: "Plasma", quantity: 5 },
      ],
      energy: 18_000, // 18kWh to research
      buildTime: 4200, // 70 minutes to research
    },
  },
  {
    id: "population-singularity",
    name: "Population Singularity",
    description: "Enables infinite population growth mechanics.",
    researched: false,
    prerequisites: ["bio-engineering"],
    recipe: {
      inputs: [
        { product: "Biomass", quantity: 50 },
        { product: "Crystals", quantity: 20 },
        { product: "Gas", quantity: 25 },
        { product: "Isotopes", quantity: 8 },
      ],
      energy: 20_000, // 20kWh to research
      buildTime: 4800, // 80 minutes to research
    },
  },
  {
    id: "fusion-cores",
    name: "Fusion Cores",
    description: "Unlocks infinite energy production.",
    researched: false,
    prerequisites: ["plasma-harnessing", "fuel-cell-production"],
    recipe: {
      inputs: [
        { product: "Plasma", quantity: 10 },
        { product: "Isotopes", quantity: 12 },
        { product: "Crystals", quantity: 25 },
        { product: "Gas", quantity: 40 },
      ],
      energy: 25_000, // 25kWh to research
      buildTime: 5400, // 90 minutes to research
    },
  },
  {
    id: "stellar-navigation",
    name: "Stellar Navigation",
    description: "Unlocks Wormhole Gates for FTL travel.",
    researched: false,
    prerequisites: ["colonization-tech"],
    recipe: {
      inputs: [
        { product: "Isotopes", quantity: 15 },
        { product: "Crystals", quantity: 35 },
        { product: "Plasma", quantity: 8 },
        { product: "Gas", quantity: 45 },
      ],
      energy: 22_000, // 22kWh to research
      buildTime: 4800, // 80 minutes to research
    },
  },
  {
    id: "self-replicating-factories",
    name: "Self-Replicating Factories",
    description: "Unlocks auto-harvesting robot swarms.",
    researched: false,
    prerequisites: ["ai-integration", "automated-drones"],
    recipe: {
      inputs: [
        { product: "Crystals", quantity: 40 },
        { product: "Isotopes", quantity: 10 },
        { product: "Plasma", quantity: 6 },
        { product: "Ore", quantity: 50 },
      ],
      energy: 28_000, // 28kWh to research
      buildTime: 5700, // 95 minutes to research
    },
  },
  {
    id: "quantum-circuits",
    name: "Quantum Circuits",
    description: "Unlocks Quantum Circuits from Electronics and Plasma.",
    researched: false,
    prerequisites: ["electronics-fabrication", "energy-expansion"],
    recipe: {
      inputs: [
        { product: "Crystals", quantity: 45 },
        { product: "Plasma", quantity: 12 },
        { product: "Isotopes", quantity: 8 },
        { product: "Gas", quantity: 30 },
      ],
      energy: 20_000, // 20kWh to research
      buildTime: 4500, // 75 minutes to research
    },
  },
  {
    id: "terraforming-agents",
    name: "Terraforming Agents",
    description: "Unlocks agents for hex terraforming.",
    researched: false,
    prerequisites: ["ecology-mastery"],
    recipe: {
      inputs: [
        { product: "Biomass", quantity: 40 },
        { product: "Crystals", quantity: 20 },
        { product: "Gas", quantity: 35 },
        { product: "Isotopes", quantity: 5 },
      ],
      energy: 16_000, // 16kWh to research
      buildTime: 3900, // 65 minutes to research
    },
  },
  {
    id: "shield-matrices",
    name: "Shield Matrices",
    description: "Unlocks defensive shields for colonies.",
    researched: false,
    prerequisites: ["plasma-harnessing", "nano-alloys"],
    recipe: {
      inputs: [
        { product: "Plasma", quantity: 15 },
        { product: "Crystals", quantity: 30 },
        { product: "Isotopes", quantity: 12 },
        { product: "Gas", quantity: 25 },
      ],
      energy: 24_000, // 24kWh to research
      buildTime: 5100, // 85 minutes to research
    },
  },
  {
    id: "hyper-fuel",
    name: "Hyper-Fuel",
    description: "Unlocks Hyper-Fuel from Fuel Cells and Isotopes.",
    researched: false,
    prerequisites: ["fuel-cell-production", "rare-material-prospecting"],
    recipe: {
      inputs: [
        { product: "Isotopes", quantity: 20 },
        { product: "Gas", quantity: 50 },
        { product: "Plasma", quantity: 8 },
        { product: "Crystals", quantity: 22 },
      ],
      energy: 19_000, // 19kWh to research
      buildTime: 4200, // 70 minutes to research
    },
  },

  // Tier 5: End-Game Dominance - Exotic artifacts and mega-structures
  {
    id: "exotic-matter-synthesis",
    name: "Exotic Matter Synthesis",
    description: "Unlocks Exotic Matter for mega-builds.",
    researched: false,
    prerequisites: ["quantum-circuits", "hyper-fuel"],
    recipe: {
      inputs: [
        { product: "Isotopes", quantity: 30 },
        { product: "Plasma", quantity: 25 },
        { product: "Crystals", quantity: 60 },
        { product: "Gas", quantity: 80 },
      ],
      energy: 40_000, // 40kWh to research
      buildTime: 7200, // 120 minutes to research
    },
  },
  {
    id: "quantum-cores",
    name: "Quantum Cores",
    description: "Unlocks Quantum Cores for advanced tech.",
    researched: false,
    prerequisites: ["exotic-matter-synthesis", "automated-drones"],
    recipe: {
      inputs: [
        { product: "Isotopes", quantity: 35 },
        { product: "Plasma", quantity: 30 },
        { product: "Crystals", quantity: 70 },
        { product: "Ore", quantity: 100 },
      ],
      energy: 50_000, // 50kWh to research
      buildTime: 9000, // 150 minutes to research
    },
  },
  {
    id: "neural-interfaces",
    name: "Neural Interfaces",
    description: "Unlocks interfaces for enhanced population control.",
    researched: false,
    prerequisites: ["population-singularity", "quantum-circuits"],
    recipe: {
      inputs: [
        { product: "Biomass", quantity: 80 },
        { product: "Crystals", quantity: 50 },
        { product: "Plasma", quantity: 20 },
        { product: "Isotopes", quantity: 25 },
      ],
      energy: 45_000, // 45kWh to research
      buildTime: 8100, // 135 minutes to research
    },
  },
  {
    id: "void-engines",
    name: "Void Engines",
    description: "Unlocks engines for deep space exploration.",
    researched: false,
    prerequisites: ["hyper-fuel", "shield-matrices"],
    recipe: {
      inputs: [
        { product: "Isotopes", quantity: 40 },
        { product: "Plasma", quantity: 35 },
        { product: "Crystals", quantity: 55 },
        { product: "Gas", quantity: 90 },
      ],
      energy: 55_000, // 55kWh to research
      buildTime: 9600, // 160 minutes to research
    },
  },
  {
    id: "stellar-forges",
    name: "Stellar Forges",
    description: "Unlocks forges for star-level resource harvesting.",
    researched: false,
    prerequisites: ["nano-alloys", "terraforming-agents"],
    recipe: {
      inputs: [
        { product: "Ore", quantity: 120 },
        { product: "Crystals", quantity: 60 },
        { product: "Plasma", quantity: 25 },
        { product: "Isotopes", quantity: 30 },
      ],
      energy: 48_000, // 48kWh to research
      buildTime: 8700, // 145 minutes to research
    },
  },
  {
    id: "ascension-modules",
    name: "Ascension Modules",
    description: "Unlocks modules for galactic transcendence.",
    researched: false,
    prerequisites: ["quantum-cores", "neural-interfaces"],
    recipe: {
      inputs: [
        { product: "Isotopes", quantity: 50 },
        { product: "Plasma", quantity: 40 },
        { product: "Crystals", quantity: 80 },
        { product: "Biomass", quantity: 100 },
      ],
      energy: 75_000, // 75kWh to research
      buildTime: 12000, // 200 minutes to research
    },
  },
  {
    id: "dyson-arrays",
    name: "Dyson Arrays",
    description: "Unlocks arrays for harvesting star energy.",
    researched: false,
    prerequisites: ["stellar-navigation", "fusion-cores"],
    recipe: {
      inputs: [
        { product: "Plasma", quantity: 60 },
        { product: "Isotopes", quantity: 45 },
        { product: "Crystals", quantity: 90 },
        { product: "Gas", quantity: 120 },
      ],
      energy: 80_000, // 80kWh to research
      buildTime: 14400, // 240 minutes to research
    },
  },
  {
    id: "bio-synthetics",
    name: "Bio-Synthetics",
    description: "Unlocks advanced bio-products for eco-dominance.",
    researched: false,
    prerequisites: ["ecology-mastery", "bio-engineering"],
    recipe: {
      inputs: [
        { product: "Biomass", quantity: 150 },
        { product: "Crystals", quantity: 40 },
        { product: "Gas", quantity: 70 },
        { product: "Isotopes", quantity: 20 },
      ],
      energy: 35_000, // 35kWh to research
      buildTime: 6600, // 110 minutes to research
    },
  },
  {
    id: "quantum-research",
    name: "Quantum Research",
    description: "Enables infinite scaling through quantum tech.",
    researched: false,
    prerequisites: ["exotic-matter-synthesis", "quantum-cores"],
    recipe: {
      inputs: [
        { product: "Isotopes", quantity: 60 },
        { product: "Plasma", quantity: 50 },
        { product: "Crystals", quantity: 100 },
        { product: "Gas", quantity: 80 },
      ],
      energy: 90_000, // 90kWh to research
      buildTime: 16200, // 270 minutes to research
    },
  },
  {
    id: "ascension-protocol",
    name: "Ascension Protocol",
    description: "Unlocks the Nexus Beacon for ultimate victory.",
    researched: false,
    prerequisites: ["ascension-modules", "dyson-arrays", "quantum-research"],
    recipe: {
      inputs: [
        { product: "Isotopes", quantity: 100 },
        { product: "Plasma", quantity: 80 },
        { product: "Crystals", quantity: 150 },
        { product: "Biomass", quantity: 200 },
        { product: "Ore", quantity: 200 },
        { product: "Gas", quantity: 150 },
      ],
      energy: 150_000, // 150kWh to research
      buildTime: 21600, // 360 minutes (6 hours) to research
    },
  },

  // Additional Branches for Depth - Military, Economy, Exploration
  {
    id: "defense-upgrades",
    name: "Defense Upgrades",
    description: "Enhances Defense Outposts against pirates.",
    researched: false,
    prerequisites: ["ai-integration"],
    recipe: {
      inputs: [
        { product: "Ore", quantity: 18 },
        { product: "Crystals", quantity: 8 },
        { product: "Gas", quantity: 12 },
      ],
      energy: 5_000, // 5kWh to research
      buildTime: 1200, // 20 minutes to research
    },
  },
  {
    id: "advanced-weapons",
    name: "Advanced Weapons",
    description: "Unlocks plasma-based turrets.",
    researched: false,
    prerequisites: ["defense-upgrades", "plasma-harnessing"],
    recipe: {
      inputs: [
        { product: "Plasma", quantity: 6 },
        { product: "Crystals", quantity: 15 },
        { product: "Ore", quantity: 25 },
        { product: "Isotopes", quantity: 3 },
      ],
      energy: 12_000, // 12kWh to research
      buildTime: 2700, // 45 minutes to research
    },
  },
  {
    id: "fleet-construction",
    name: "Fleet Construction",
    description: "Allows building defensive fleets.",
    researched: false,
    prerequisites: ["colonization-tech", "machinery-assembly"],
    recipe: {
      inputs: [
        { product: "Ore", quantity: 40 },
        { product: "Crystals", quantity: 20 },
        { product: "Gas", quantity: 30 },
        { product: "Isotopes", quantity: 5 },
      ],
      energy: 15_000, // 15kWh to research
      buildTime: 3300, // 55 minutes to research
    },
  },
  {
    id: "economic-optimization",
    name: "Economic Optimization",
    description: "Improves resource yield ratios.",
    researched: false,
    prerequisites: ["basic-refining", "ecology-mastery"],
    recipe: {
      inputs: [
        { product: "Ore", quantity: 30 },
        { product: "Biomass", quantity: 20 },
        { product: "Crystals", quantity: 12 },
        { product: "Gas", quantity: 18 },
      ],
      energy: 8_000, // 8kWh to research
      buildTime: 2100, // 35 minutes to research
    },
  },
  {
    id: "trade-networks",
    name: "Trade Networks",
    description: "Prepares for future multiplayer trading (AI simulated now).",
    researched: false,
    prerequisites: ["economic-optimization", "stellar-navigation"],
    recipe: {
      inputs: [
        { product: "Crystals", quantity: 25 },
        { product: "Gas", quantity: 35 },
        { product: "Isotopes", quantity: 8 },
        { product: "Plasma", quantity: 4 },
      ],
      energy: 18_000, // 18kWh to research
      buildTime: 3900, // 65 minutes to research
    },
  },
  {
    id: "exploration-drones",
    name: "Exploration Drones",
    description: "Unlocks long-range scout drones.",
    researched: false,
    prerequisites: ["terrain-analysis", "automated-drones"],
    recipe: {
      inputs: [
        { product: "Crystals", quantity: 20 },
        { product: "Ore", quantity: 28 },
        { product: "Gas", quantity: 22 },
        { product: "Plasma", quantity: 3 },
      ],
      energy: 11_000, // 11kWh to research
      buildTime: 2700, // 45 minutes to research
    },
  },
  {
    id: "planetary-mapping",
    name: "Planetary Mapping",
    description: "Fully reveals planet hex grids.",
    researched: false,
    prerequisites: ["exploration-drones"],
    recipe: {
      inputs: [
        { product: "Crystals", quantity: 30 },
        { product: "Gas", quantity: 25 },
        { product: "Isotopes", quantity: 5 },
        { product: "Biomass", quantity: 15 },
      ],
      energy: 14_000, // 14kWh to research
      buildTime: 3300, // 55 minutes to research
    },
  },
  {
    id: "interstellar-scanning",
    name: "Interstellar Scanning",
    description: "Scans distant planets for resources.",
    researched: false,
    prerequisites: ["planetary-mapping", "stellar-navigation"],
    recipe: {
      inputs: [
        { product: "Isotopes", quantity: 12 },
        { product: "Crystals", quantity: 40 },
        { product: "Plasma", quantity: 8 },
        { product: "Gas", quantity: 35 },
      ],
      energy: 25_000, // 25kWh to research
      buildTime: 5100, // 85 minutes to research
    },
  },
  {
    id: "bio-plastics",
    name: "Bio-Plastics",
    description: "Unlocks Bio-Plastics from Biomass and Crystals.",
    researched: false,
    prerequisites: ["bio-engineering", "resource-diversification"],
    recipe: {
      inputs: [
        { product: "Biomass", quantity: 35 },
        { product: "Crystals", quantity: 18 },
        { product: "Gas", quantity: 20 },
      ],
      energy: 7_500, // 7.5kWh to research
      buildTime: 1800, // 30 minutes to research
    },
  },
  {
    id: "energy-conduits",
    name: "Energy Conduits",
    description: "Unlocks conduits for efficient energy transfer.",
    researched: false,
    prerequisites: ["efficient-grids", "alloy-forging"],
    recipe: {
      inputs: [
        { product: "Ore", quantity: 32 },
        { product: "Crystals", quantity: 16 },
        { product: "Gas", quantity: 24 },
      ],
      energy: 9_000, // 9kWh to research
      buildTime: 2400, // 40 minutes to research
    },
  },
]
