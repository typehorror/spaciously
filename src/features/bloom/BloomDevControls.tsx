/*
 * BloomDevControls
 *
 * Dev-only section inside the cell inspector. Displays the cell's current
 * infestation and offers a "Seed Bloom" button that bumps it by a fixed
 * amount — useful for exercising the simulator on demand and for staging
 * combat scenarios that the scripted infection event (InfectionTicker)
 * does not produce on its own.
 *
 * Rendered inside CellInformation for every cell, regardless of knowledge
 * or claim state. The button is harmless on developed cells too — useful
 * for testing siege/breach later.
 */
import { type Cell } from "@/features/cell/types"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { infestationSeeded, selectInfestation } from "./bloomSlice"
import { Button } from "@/components/ui/button"

const SEED_INCREMENT = 3

interface Props {
  cell: Cell
}

export const BloomDevControls = ({ cell }: Props) => {
  const dispatch = useAppDispatch()
  const infestation = useAppSelector(state => selectInfestation(state, cell.id))

  return (
    <div className="mt-4 mx-4 mb-3 rounded-md ring-1 ring-fuchsia-400/30 bg-fuchsia-500/5 px-3 py-2">
      <div className="flex items-baseline justify-between gap-2">
        <div className="text-[10px] uppercase tracking-[0.2em] text-fuchsia-300/80">
          Bloom · dev
        </div>
        <div className="font-mono text-xs tabular-nums text-fuchsia-100">
          Infestation: {infestation.toFixed(2)}
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="mt-2 h-7 text-xs text-fuchsia-200 hover:text-fuchsia-100 hover:bg-fuchsia-500/10"
        onClick={() => {
          dispatch(
            infestationSeeded({
              cellId: cell.id,
              amount: infestation + SEED_INCREMENT,
            }),
          )
        }}
      >
        + Seed Bloom (+{SEED_INCREMENT})
      </Button>
    </div>
  )
}
