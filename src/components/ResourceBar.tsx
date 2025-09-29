import { useAppSelector } from "@/app/hooks"
import { selectEnergyInfo } from "@/features/energy/selectors"
import {
  selectPlanetHabitation,
  selectPlanetWarehousesContent,
} from "@/features/cell/cellSlice"
import {
  AtomIcon,
  FlameIcon,
  GemIcon,
  PickaxeIcon,
  RadiationIcon,
  TreeDeciduousIcon,
  UsersRoundIcon,
  ZapIcon,
} from "lucide-react"

interface Props {
  planetId: number
}

export const ResourceBar = ({ planetId }: Props) => {
  const content = useAppSelector(state =>
    selectPlanetWarehousesContent(state, planetId),
  )

  const habitat = useAppSelector(state =>
    selectPlanetHabitation(state, planetId),
  )

  const energy = useAppSelector(state => selectEnergyInfo(state, planetId))

  const getEnergyUnit = (
    value: number,
  ): { unit: string; multiplier: number } => {
    if (value >= 1_000_000) {
      return { unit: "MWh", multiplier: 1_000_000 }
    } else if (value >= 1_000) {
      return { unit: "kWh", multiplier: 1_000 }
    }
    return { unit: "Wh", multiplier: 1 }
  }

  const { unit, multiplier } = getEnergyUnit(
    Math.max(energy.consumed, energy.produced),
  )

  const {
    Gas: gas,
    Ore: ore,
    Biomass: biomass,
    Crystals: crystals,
    Plasma: plasma,
    Isotopes: isotopes,
  } = content
  const itemClass =
    "flex items-center gap-2 px-2 py-1 rounded-md bg-background/20 text-sm text-gray-100"

  return (
    <div className="flex items-center gap-2">
      <div className={itemClass} title="Gas">
        <FlameIcon
          className="w-4 h-4 text-red-500"
          fill="currentColor"
          strokeWidth={1}
        />
        <span className="tabular-nums">{gas ?? 0}</span>
      </div>

      <div className={itemClass} title="Ore">
        <PickaxeIcon
          fill="currentColor"
          className="w-4 h-4 text-stone-400"
          strokeWidth={0}
        />
        <span className="tabular-nums">{ore ?? 0}</span>
      </div>
      <div className={itemClass} title="Biomass">
        <TreeDeciduousIcon
          fill="currentColor"
          className="w-4 h-4 text-green-500"
        />
        <span className="tabular-nums">{biomass ?? 0}</span>
      </div>
      <div className={itemClass} title="Crystals">
        <GemIcon className="w-4 h-4 text-blue-500" />
        <span className="tabular-nums">{crystals ?? 0}</span>
      </div>
      <div className={itemClass} title="Plasma">
        <RadiationIcon
          fill="currentColor"
          className="w-4 h-4 text-yellow-500"
        />
        <span className="tabular-nums">{plasma ?? 0}</span>
      </div>
      <div className={itemClass} title="Isotopes">
        <AtomIcon className="w-4 h-4 text-purple-500" />
        <span className="tabular-nums">{isotopes ?? 0}</span>
      </div>

      <div className={itemClass} title="Population">
        <UsersRoundIcon
          fill="currentColor"
          className="w-4 h-4 text-orange-300"
        />
        <span className="tabular-nums">
          {habitat.population}/{habitat.capacity}
        </span>
      </div>

      <div className={itemClass} title="Energy">
        <ZapIcon className="w-4 h-4 text-blue-500" fill="currentColor" />
        <span className="tabular-nums">
          {(energy.consumed / multiplier).toFixed(1)}/
          {(energy.produced / multiplier).toFixed(1)}
          {unit}
        </span>
      </div>
    </div>
  )
}

export default ResourceBar
