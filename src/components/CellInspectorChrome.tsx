/**
 * CellInspectorChrome
 *
 * Shared visual primitives for the right-side cell inspector. Keeps the
 * "ship console" aesthetic consistent across developed and unclaimed cell
 * panels:
 *
 *   - CellHeader     — top-of-panel identity (state badge + coordinates)
 *   - ConsoleSection — collapsible-looking section wrapper with a labeled
 *                      console-style header, accent rule, and an optional
 *                      meta value on the right
 *
 * These intentionally have no behavior of their own — they're presentational
 * shells so the inspector panels can focus on data.
 */
import { cn } from "@/lib/utils"
import { type LucideIcon } from "lucide-react"
import { type ReactNode } from "react"

type Accent = "cyan" | "emerald" | "amber"

const accentClasses: Record<
  Accent,
  { dot: string; label: string; ring: string; bar: string }
> = {
  cyan: {
    dot: "bg-cyan-400",
    label: "text-cyan-300/80",
    ring: "ring-cyan-400/30",
    bar: "from-cyan-400/40 via-cyan-400/10",
  },
  emerald: {
    dot: "bg-emerald-400",
    label: "text-emerald-300/80",
    ring: "ring-emerald-400/30",
    bar: "from-emerald-400/40 via-emerald-400/10",
  },
  amber: {
    dot: "bg-amber-400",
    label: "text-amber-300/80",
    ring: "ring-amber-400/30",
    bar: "from-amber-400/40 via-amber-400/10",
  },
}

interface CellHeaderProps {
  label: string
  coord: { q: number; r: number }
  accent?: Accent
}

export const CellHeader = ({
  label,
  coord,
  accent = "cyan",
}: CellHeaderProps) => {
  const a = accentClasses[accent]
  return (
    <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/10">
      <div className="flex items-center gap-2.5">
        <span
          className={cn("w-1.5 h-1.5 rounded-full ring-2", a.dot, a.ring)}
          aria-hidden
        />
        <div className="leading-tight">
          <div
            className={cn(
              "text-[10px] uppercase tracking-[0.25em]",
              a.label,
            )}
          >
            ◢ {label}
          </div>
          <div className="text-sm font-semibold text-white/90 tabular-nums">
            ({coord.q}, {coord.r})
          </div>
        </div>
      </div>
    </div>
  )
}

interface ConsoleSectionProps {
  title: string
  icon?: LucideIcon
  meta?: ReactNode
  children: ReactNode
}

export const ConsoleSection = ({
  title,
  icon: Icon,
  meta,
  children,
}: ConsoleSectionProps) => (
  <section className="flex flex-col gap-2">
    <header className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-cyan-300/70">
        {Icon && <Icon className="w-3.5 h-3.5" />}
        <h4 className="text-[10px] uppercase tracking-[0.25em] font-medium">
          {title}
        </h4>
      </div>
      {meta !== undefined && meta !== null && meta !== "" && (
        <div className="text-xs text-white/50 tabular-nums">{meta}</div>
      )}
    </header>
    <div
      className="h-px bg-gradient-to-r from-cyan-400/20 via-cyan-400/5 to-transparent"
      aria-hidden
    />
    <div className="pt-1">{children}</div>
  </section>
)
