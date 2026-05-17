/**
 * ResourceBar
 *
 * Glanceable HUD strip for the planet's resource stocks, energy budget, and
 * population. Built as a horizontal cluster of "chips", with two visual groups:
 *
 *   raw resources (Gas, Ore, Biomass, Crystals, Plasma, Isotopes)
 *   | vitals (Population, Energy)
 *
 * Each chip is a Radix Tooltip — hover reveals the full name and any extra
 * context we don't have room to display in the strip. Chips can flag a
 * "warning" state (e.g. energy net < 0, population at cap) which tints the
 * value and the icon, drawing the eye without changing layout.
 *
 * Public API:
 *   <ResourceBar planetId={number} />
 *
 * Responsive notes: at widths below `md`, the less-critical raw resources
 * collapse — Crystals/Plasma/Isotopes hide first, since they ramp up later
 * in the tech tree. Population and Energy always stay visible.
 */
import { useAppSelector } from "@/app/hooks"
import { selectEnergyInfo } from "@/features/energy/selectors"
import {
  selectPlanetHabitation,
  selectPlanetWarehousesContent,
} from "@/features/cell/cellSlice"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import {
  AtomIcon,
  FlameIcon,
  GemIcon,
  PickaxeIcon,
  RadiationIcon,
  TreeDeciduousIcon,
  UsersRoundIcon,
  ZapIcon,
  type LucideIcon,
} from "lucide-react"

interface Props {
  planetId: number
}

interface ChipProps {
  name: string
  icon: LucideIcon
  iconClass: string
  fillIcon?: boolean
  value: string
  detail?: string
  warning?: boolean
  hideUntil?: "md" | "lg" | "xl" | "2xl"
}

// Hidden-until-breakpoint utility classes. Tailwind can't generate dynamic
// class names at build time, so we keep this lookup explicit. Each chip
// declares the minimum viewport width at which it starts being visible —
// progressively revealing secondary resources as the header gains room.
const visibilityClass: Record<NonNullable<ChipProps["hideUntil"]>, string> = {
  md: "hidden md:flex",
  lg: "hidden lg:flex",
  xl: "hidden xl:flex",
  "2xl": "hidden 2xl:flex",
}

const Chip = ({
  name,
  icon: Icon,
  iconClass,
  fillIcon = false,
  value,
  detail,
  warning = false,
  hideUntil,
}: ChipProps) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <div
        className={cn(
          "flex items-center gap-1.5 px-2 py-1 rounded-md text-sm tabular-nums whitespace-nowrap transition-colors",
          "bg-white/[0.03] hover:bg-white/[0.06]",
          warning && "bg-red-500/15 ring-1 ring-red-400/30",
          hideUntil && visibilityClass[hideUntil],
        )}
      >
        <Icon
          className={cn(
            "w-4 h-4 shrink-0",
            warning ? "text-red-300" : iconClass,
          )}
          fill={fillIcon ? "currentColor" : "none"}
          strokeWidth={fillIcon ? 1 : 2}
        />
        <span className={cn(warning ? "text-red-100" : "text-gray-100")}>
          {value}
        </span>
      </div>
    </TooltipTrigger>
    <TooltipContent side="bottom" className="font-mono text-xs">
      <div className="font-semibold">{name}</div>
      {detail && <div className="text-muted-foreground">{detail}</div>}
    </TooltipContent>
  </Tooltip>
)

// Auto-pick a human-friendly energy unit so we never display giant raw watt-hour
// numbers. Returns the divisor we multiply through to get the displayed value.
const formatEnergyUnit = (
  value: number,
): { unit: string; multiplier: number } => {
  if (value >= 1_000_000) return { unit: "MWh", multiplier: 1_000_000 }
  if (value >= 1_000) return { unit: "kWh", multiplier: 1_000 }
  return { unit: "Wh", multiplier: 1 }
}

export const ResourceBar = ({ planetId }: Props) => {
  const content = useAppSelector(state =>
    selectPlanetWarehousesContent(state, planetId),
  )
  const habitat = useAppSelector(state =>
    selectPlanetHabitation(state, planetId),
  )
  const energy = useAppSelector(state => selectEnergyInfo(state, planetId))

  const { unit, multiplier } = formatEnergyUnit(
    Math.max(energy.consumed, energy.produced),
  )
  const fmtEnergy = (v: number) => (v / multiplier).toFixed(v >= 1000 ? 1 : 0)
  const energyNet = energy.produced - energy.consumed
  const energyDeficit = energyNet < 0

  const populationAtCap =
    habitat.capacity > 0 && habitat.population >= habitat.capacity

  return (
    <div className="flex items-center gap-3">
      {/* Raw resources cluster */}
      <div className="flex items-center gap-1.5">
        <Chip
          name="Gas"
          icon={FlameIcon}
          iconClass="text-red-400"
          fillIcon
          value={String(content.Gas ?? 0)}
        />
        <Chip
          name="Ore"
          icon={PickaxeIcon}
          iconClass="text-stone-400"
          fillIcon
          value={String(content.Ore ?? 0)}
        />
        <Chip
          name="Biomass"
          icon={TreeDeciduousIcon}
          iconClass="text-green-400"
          fillIcon
          value={String(content.Biomass ?? 0)}
        />
        <Chip
          name="Crystals"
          icon={GemIcon}
          iconClass="text-sky-400"
          value={String(content.Crystals ?? 0)}
          hideUntil="xl"
        />
        <Chip
          name="Plasma"
          icon={RadiationIcon}
          iconClass="text-yellow-400"
          fillIcon
          value={String(content.Plasma ?? 0)}
          hideUntil="xl"
        />
        <Chip
          name="Isotopes"
          icon={AtomIcon}
          iconClass="text-purple-400"
          value={String(content.Isotopes ?? 0)}
          hideUntil="2xl"
        />
      </div>

      {/* Divider between raw resources and vitals */}
      <div className="h-5 w-px bg-white/10" aria-hidden />

      {/* Vitals cluster */}
      <div className="flex items-center gap-1.5">
        <Chip
          name="Population"
          icon={UsersRoundIcon}
          iconClass="text-orange-300"
          fillIcon
          value={`${habitat.population.toString()} / ${habitat.capacity.toString()}`}
          detail={populationAtCap ? "At capacity" : undefined}
          warning={populationAtCap}
        />
        <Chip
          name="Energy"
          icon={ZapIcon}
          iconClass="text-blue-400"
          fillIcon
          value={`${fmtEnergy(energy.consumed)} / ${fmtEnergy(energy.produced)} ${unit}`}
          detail={
            energyDeficit
              ? `Deficit: ${fmtEnergy(Math.abs(energyNet))} ${unit}`
              : `Surplus: ${fmtEnergy(energyNet)} ${unit}`
          }
          warning={energyDeficit}
        />
      </div>
    </div>
  )
}

export default ResourceBar
