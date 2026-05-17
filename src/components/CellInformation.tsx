/**
 * CellInformation
 *
 * Right-side inspector panel for the currently focused hex cell. Renders one
 * of three states:
 *
 *   - No cell focused      → console-style empty state
 *   - Developed cell       → DevelopedCellPanel (habitation, warehouse, production, buildings)
 *   - Wild / unclaimed     → UnoccupiedCellInformation (resources, terraform action)
 *
 * Wraps both panels in a shared "ship console" frame: a cyan accent line at
 * the top, subtle radial glow on the inner left-edge, and a left border that
 * echoes the main HUD header. Inner panels supply their own section content;
 * this file only owns the chrome and the routing.
 */
import { useAppSelector } from "@/app/hooks"
import {
  selectCurrentPlanetId,
  selectFocusedCellCoord,
} from "@/features/planet/planetSlice"
import { selectCellByCoords } from "@/features/cell/cellSlice"

import UnoccupiedCellInformation from "./UnoccupiedCellInformation"
import DevelopedCellPanel from "./DevelopedCellPanel"
import { HexCellState } from "@/features/cell/types"
import { ScanSearchIcon } from "lucide-react"
import { type ReactNode } from "react"

const ConsoleFrame = ({ children }: { children: ReactNode }) => (
  <div className="relative h-full border-l border-cyan-400/15 bg-black/30">
    <div
      className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"
      aria-hidden
    />
    <div className="absolute inset-y-0 left-0 w-24 bg-[radial-gradient(ellipse_at_left,_rgba(56,189,248,0.05),_transparent_70%)] pointer-events-none" />
    <div className="relative h-full overflow-auto">{children}</div>
  </div>
)

const EmptyState = () => (
  <div className="h-full flex flex-col items-center justify-center gap-3 text-center px-6">
    <div className="grid place-items-center w-12 h-12 rounded-sm bg-cyan-400/5 ring-1 ring-cyan-400/20">
      <ScanSearchIcon className="w-5 h-5 text-cyan-300/70" />
    </div>
    <div className="leading-tight">
      <div className="text-[10px] uppercase tracking-[0.3em] text-cyan-300/70">
        ◢ Console
      </div>
      <div className="text-sm text-white/70 mt-1">No cell selected</div>
    </div>
    <p className="text-xs text-white/40 max-w-[14rem]">
      Pick a hex on the planet to inspect its resources, buildings, and
      production.
    </p>
  </div>
)

export const CellInformation = () => {
  const currentPlanetId = useAppSelector(selectCurrentPlanetId)
  const focusedCellCoord = useAppSelector(selectFocusedCellCoord)
  const focusedCell = useAppSelector(state =>
    selectCellByCoords(state, focusedCellCoord, currentPlanetId),
  )

  return (
    <ConsoleFrame>
      {!focusedCell ? (
        <EmptyState />
      ) : focusedCell.state === HexCellState.DEVELOPED ? (
        <DevelopedCellPanel cell={focusedCell} />
      ) : (
        <UnoccupiedCellInformation cell={focusedCell} />
      )}
    </ConsoleFrame>
  )
}
