import { type Research } from "./types" // Assuming the type is imported from your file

export const researchTree: Research[] = [
  // Tier 1: Foundations - Starting researches, no prerequisites
  {
    id: "resource-extraction",
    name: "Resource Extraction",
    description: "Unlocks basic extractors for Ore, Gas, and Biomass.",
    cost: 0,
    researched: false,
    prerequisites: [],
    duration: 300000, // 5 minutes
  },
  {
    id: "habitation-basics",
    name: "Habitation Basics",
    description: "Unlocks basic habitation modules for population growth.",
    cost: 0,
    researched: false,
    prerequisites: [],
    duration: 300000, // 5 minutes
  },
  {
    id: "energy-generation",
    name: "Energy Generation",
    description: "Unlocks simple power plants for energy production.",
    cost: 0,
    researched: false,
    prerequisites: [],
    duration: 300000, // 5 minutes
  },

  // Tier 2: Early Growth - Builds on foundations
  {
    id: "basic-refining",
    name: "Basic Refining",
    description: "Unlocks refineries for processing Ore into Refined Ore.",
    cost: 0,
    researched: false,
    prerequisites: ["resource-extraction"],
    duration: 300000, // 5 minutes
  },
  {
    id: "life-support-systems",
    name: "Life Support Systems",
    description:
      "Enables habitation in harsh environments and unlocks Synthetics.",
    cost: 0,
    researched: false,
    prerequisites: ["habitation-basics"],
    duration: 300000, // 5 minutes
  },
  {
    id: "efficient-grids",
    name: "Efficient Grids",
    description: "Improves energy distribution with wireless grids.",
    cost: 0,
    researched: false,
    prerequisites: ["energy-generation"],
    duration: 300000, // 5 minutes
  },
  {
    id: "terrain-analysis",
    name: "Terrain Analysis",
    description: "Reveals hidden hex stats and unlocks Scout Drones.",
    cost: 0,
    researched: false,
    prerequisites: ["resource-extraction"],
    duration: 300000, // 5 minutes
  },
  {
    id: "population-incentives",
    name: "Population Incentives",
    description: "Boosts population growth through morale events.",
    cost: 0,
    researched: false,
    prerequisites: ["habitation-basics"],
    duration: 300000, // 5 minutes
  },
  {
    id: "renewable-sources",
    name: "Renewable Sources",
    description: "Unlocks Biomass-to-Energy conversion.",
    cost: 0,
    researched: false,
    prerequisites: ["energy-generation"],
    duration: 300000, // 5 minutes
  },

  // Resource Unlocks - Phased introduction of new raw resources
  {
    id: "resource-diversification",
    name: "Resource Diversification",
    description: "Unlocks extraction of Crystals.",
    cost: 0,
    researched: false,
    prerequisites: ["resource-extraction", "terrain-analysis"],
    duration: 300000, // 5 minutes
  },
  {
    id: "energy-expansion",
    name: "Energy Expansion",
    description: "Unlocks extraction of Plasma.",
    cost: 0,
    researched: false,
    prerequisites: ["efficient-grids", "renewable-sources"],
    duration: 300000, // 5 minutes
  },
  {
    id: "rare-material-prospecting",
    name: "Rare Material Prospecting",
    description: "Unlocks extraction of Isotopes.",
    cost: 0,
    researched: false,
    prerequisites: ["resource-diversification", "energy-expansion"],
    duration: 300000, // 5 minutes
  },

  // Tier 3: Intermediate Expansion - More products and buildings
  {
    id: "alloy-forging",
    name: "Alloy Forging",
    description: "Unlocks Alloys from Refined Ore and Crystals.",
    cost: 0,
    researched: false,
    prerequisites: ["basic-refining", "resource-diversification"],
    duration: 300000, // 5 minutes
  },
  {
    id: "machinery-assembly",
    name: "Machinery Assembly",
    description: "Unlocks Machinery from Alloys and Gas.",
    cost: 0,
    researched: false,
    prerequisites: ["alloy-forging"],
    duration: 300000, // 5 minutes
  },
  {
    id: "bio-engineering",
    name: "Bio-Engineering",
    description: "Unlocks advanced Hab Domes and Bio-Enhancers.",
    cost: 0,
    researched: false,
    prerequisites: ["life-support-systems"],
    duration: 300000, // 5 minutes
  },
  {
    id: "plasma-harnessing",
    name: "Plasma Harnessing",
    description: "Upgrades power plants to Fusion Reactors.",
    cost: 0,
    researched: false,
    prerequisites: ["energy-expansion"],
    duration: 300000, // 5 minutes
  },
  {
    id: "colonization-tech",
    name: "Colonization Tech",
    description: "Unlocks basic Colonization Ships.",
    cost: 0,
    researched: false,
    prerequisites: ["terrain-analysis", "machinery-assembly"],
    duration: 300000, // 5 minutes
  },
  {
    id: "ai-integration",
    name: "AI Integration",
    description: "Unlocks smart buildings and Defense Outposts.",
    cost: 0,
    researched: false,
    prerequisites: ["population-incentives", "machinery-assembly"],
    duration: 300000, // 5 minutes
  },
  {
    id: "ecology-mastery",
    name: "Ecology Mastery",
    description: "Boosts yields through terraforming.",
    cost: 0,
    researched: false,
    prerequisites: ["renewable-sources", "bio-engineering"],
    duration: 300000, // 5 minutes
  },
  {
    id: "electronics-fabrication",
    name: "Electronics Fabrication",
    description: "Unlocks Electronics from Crystals and Ore.",
    cost: 0,
    researched: false,
    prerequisites: ["resource-diversification", "basic-refining"],
    duration: 300000, // 5 minutes
  },
  {
    id: "fuel-cell-production",
    name: "Fuel Cell Production",
    description: "Unlocks Fuel Cells from Gas and Isotopes.",
    cost: 0,
    researched: false,
    prerequisites: ["rare-material-prospecting", "efficient-grids"],
    duration: 300000, // 5 minutes
  },

  // Tier 4: Advanced Optimization - Deeper products and upgrades
  {
    id: "nano-alloys",
    name: "Nano-Alloys",
    description: "Unlocks Nano-Alloys from Alloys and Electronics.",
    cost: 0,
    researched: false,
    prerequisites: ["alloy-forging", "electronics-fabrication"],
    duration: 300000, // 5 minutes
  },
  {
    id: "automated-drones",
    name: "Automated Drones",
    description: "Unlocks drone swarms for automation.",
    cost: 0,
    researched: false,
    prerequisites: ["machinery-assembly", "ai-integration"],
    duration: 300000, // 5 minutes
  },
  {
    id: "population-singularity",
    name: "Population Singularity",
    description: "Enables infinite population growth mechanics.",
    cost: 0,
    researched: false,
    prerequisites: ["bio-engineering"],
    duration: 300000, // 5 minutes
  },
  {
    id: "fusion-cores",
    name: "Fusion Cores",
    description: "Unlocks infinite energy production.",
    cost: 0,
    researched: false,
    prerequisites: ["plasma-harnessing", "fuel-cell-production"],
    duration: 300000, // 5 minutes
  },
  {
    id: "stellar-navigation",
    name: "Stellar Navigation",
    description: "Unlocks Wormhole Gates for FTL travel.",
    cost: 0,
    researched: false,
    prerequisites: ["colonization-tech"],
    duration: 300000, // 5 minutes
  },
  {
    id: "self-replicating-factories",
    name: "Self-Replicating Factories",
    description: "Unlocks auto-harvesting robot swarms.",
    cost: 0,
    researched: false,
    prerequisites: ["ai-integration", "automated-drones"],
    duration: 300000, // 5 minutes
  },
  {
    id: "quantum-circuits",
    name: "Quantum Circuits",
    description: "Unlocks Quantum Circuits from Electronics and Plasma.",
    cost: 0,
    researched: false,
    prerequisites: ["electronics-fabrication", "energy-expansion"],
    duration: 300000, // 5 minutes
  },
  {
    id: "terraforming-agents",
    name: "Terraforming Agents",
    description: "Unlocks agents for hex terraforming.",
    cost: 0,
    researched: false,
    prerequisites: ["ecology-mastery"],
    duration: 300000, // 5 minutes
  },
  {
    id: "shield-matrices",
    name: "Shield Matrices",
    description: "Unlocks defensive shields for colonies.",
    cost: 0,
    researched: false,
    prerequisites: ["plasma-harnessing", "nano-alloys"],
    duration: 300000, // 5 minutes
  },
  {
    id: "hyper-fuel",
    name: "Hyper-Fuel",
    description: "Unlocks Hyper-Fuel from Fuel Cells and Isotopes.",
    cost: 0,
    researched: false,
    prerequisites: ["fuel-cell-production", "rare-material-prospecting"],
    duration: 300000, // 5 minutes
  },

  // Tier 5: End-Game Dominance - Exotic artifacts and mega-structures
  {
    id: "exotic-matter-synthesis",
    name: "Exotic Matter Synthesis",
    description: "Unlocks Exotic Matter for mega-builds.",
    cost: 0,
    researched: false,
    prerequisites: ["quantum-circuits", "hyper-fuel"],
    duration: 300000, // 5 minutes
  },
  {
    id: "quantum-cores",
    name: "Quantum Cores",
    description: "Unlocks Quantum Cores for advanced tech.",
    cost: 0,
    researched: false,
    prerequisites: ["exotic-matter-synthesis", "automated-drones"],
    duration: 300000, // 5 minutes
  },
  {
    id: "neural-interfaces",
    name: "Neural Interfaces",
    description: "Unlocks interfaces for enhanced population control.",
    cost: 0,
    researched: false,
    prerequisites: ["population-singularity", "quantum-circuits"],
    duration: 300000, // 5 minutes
  },
  {
    id: "void-engines",
    name: "Void Engines",
    description: "Unlocks engines for deep space exploration.",
    cost: 0,
    researched: false,
    prerequisites: ["hyper-fuel", "shield-matrices"],
    duration: 300000, // 5 minutes
  },
  {
    id: "stellar-forges",
    name: "Stellar Forges",
    description: "Unlocks forges for star-level resource harvesting.",
    cost: 0,
    researched: false,
    prerequisites: ["nano-alloys", "terraforming-agents"],
    duration: 300000, // 5 minutes
  },
  {
    id: "ascension-modules",
    name: "Ascension Modules",
    description: "Unlocks modules for galactic transcendence.",
    cost: 0,
    researched: false,
    prerequisites: ["quantum-cores", "neural-interfaces"],
    duration: 300000, // 5 minutes
  },
  {
    id: "dyson-arrays",
    name: "Dyson Arrays",
    description: "Unlocks arrays for harvesting star energy.",
    cost: 0,
    researched: false,
    prerequisites: ["stellar-navigation", "fusion-cores"],
    duration: 300000, // 5 minutes
  },
  {
    id: "bio-synthetics",
    name: "Bio-Synthetics",
    description: "Unlocks advanced bio-products for eco-dominance.",
    cost: 0,
    researched: false,
    prerequisites: ["ecology-mastery", "bio-engineering"],
    duration: 300000, // 5 minutes
  },
  {
    id: "quantum-research",
    name: "Quantum Research",
    description: "Enables infinite scaling through quantum tech.",
    cost: 0,
    researched: false,
    prerequisites: ["exotic-matter-synthesis", "quantum-cores"],
    duration: 300000, // 5 minutes
  },
  {
    id: "ascension-protocol",
    name: "Ascension Protocol",
    description: "Unlocks the Nexus Beacon for ultimate victory.",
    cost: 0,
    researched: false,
    prerequisites: ["ascension-modules", "dyson-arrays", "quantum-research"],
    duration: 300000, // 5 minutes
  },

  // Additional Branches for Depth - Military, Economy, Exploration
  {
    id: "defense-upgrades",
    name: "Defense Upgrades",
    description: "Enhances Defense Outposts against pirates.",
    cost: 0,
    researched: false,
    prerequisites: ["ai-integration"],
    duration: 300000, // 5 minutes
  },
  {
    id: "advanced-weapons",
    name: "Advanced Weapons",
    description: "Unlocks plasma-based turrets.",
    cost: 0,
    researched: false,
    prerequisites: ["defense-upgrades", "plasma-harnessing"],
    duration: 300000, // 5 minutes
  },
  {
    id: "fleet-construction",
    name: "Fleet Construction",
    description: "Allows building defensive fleets.",
    cost: 0,
    researched: false,
    prerequisites: ["colonization-tech", "machinery-assembly"],
    duration: 300000, // 5 minutes
  },
  {
    id: "economic-optimization",
    name: "Economic Optimization",
    description: "Improves resource yield ratios.",
    cost: 0,
    researched: false,
    prerequisites: ["basic-refining", "ecology-mastery"],
    duration: 300000, // 5 minutes
  },
  {
    id: "trade-networks",
    name: "Trade Networks",
    description: "Prepares for future multiplayer trading (AI simulated now).",
    cost: 0,
    researched: false,
    prerequisites: ["economic-optimization", "stellar-navigation"],
    duration: 300000, // 5 minutes
  },
  {
    id: "exploration-drones",
    name: "Exploration Drones",
    description: "Unlocks long-range scout drones.",
    cost: 0,
    researched: false,
    prerequisites: ["terrain-analysis", "automated-drones"],
    duration: 300000, // 5 minutes
  },
  {
    id: "planetary-mapping",
    name: "Planetary Mapping",
    description: "Fully reveals planet hex grids.",
    cost: 0,
    researched: false,
    prerequisites: ["exploration-drones"],
    duration: 300000, // 5 minutes
  },
  {
    id: "interstellar-scanning",
    name: "Interstellar Scanning",
    description: "Scans distant planets for resources.",
    cost: 0,
    researched: false,
    prerequisites: ["planetary-mapping", "stellar-navigation"],
    duration: 300000, // 5 minutes
  },
  {
    id: "bio-plastics",
    name: "Bio-Plastics",
    description: "Unlocks Bio-Plastics from Biomass and Crystals.",
    cost: 0,
    researched: false,
    prerequisites: ["bio-engineering", "resource-diversification"],
    duration: 300000, // 5 minutes
  },
  {
    id: "energy-conduits",
    name: "Energy Conduits",
    description: "Unlocks conduits for efficient energy transfer.",
    cost: 0,
    researched: false,
    prerequisites: ["efficient-grids", "alloy-forging"],
    duration: 300000, // 5 minutes
  },
]
