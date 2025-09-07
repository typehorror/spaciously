import { useAppSelector } from "@/app/hooks"
import { getEnergyInfo } from "@/features/energy/selectors"
import { getPlanetPopulation } from "@/features/habitat/habitatSlice"
import { getPlanetWarehousesContent } from "@/features/warehouse/warehouseSlice"
import {
  FireIcon,
  CubeIcon,
  UsersIcon,
  BoltIcon,
} from "@heroicons/react/24/solid"

type Props = {
  planetId: number
}

export const ResourceBar = ({ planetId }: Props) => {
  const content = useAppSelector(state =>
    getPlanetWarehousesContent(state, planetId),
  )

  const population = useAppSelector(state =>
    getPlanetPopulation(state, planetId),
  )

  const energy = useAppSelector(state => getEnergyInfo(state, planetId))

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

  const { Gas: gas, Ore: ore } = content
  const itemClass =
    "flex items-center gap-2 px-2 py-1 rounded-md bg-background/20 text-sm text-gray-100"

  return (
    <div className="flex items-center gap-2">
      <div className={itemClass} title="Gas">
        <FireIcon className="w-4 h-4 text-red-500" />
        <span className="tabular-nums">{gas ?? 0}</span>
      </div>

      <div className={itemClass} title="Ore">
        <CubeIcon className="w-4 h-4 text-orange-500" />
        <span className="tabular-nums">{ore ?? 0}</span>
      </div>

      <div className={itemClass} title="Population">
        <UsersIcon className="w-4 h-4 text-green-500" />
        <span className="tabular-nums">{population}</span>
      </div>

      <div className={itemClass} title="Energy">
        <BoltIcon className="w-4 h-4 text-sky-500" />
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
