/*
 * EconomyDevControls
 *
 * Dev-only section inside the cell inspector. Drops a fixed quantity of
 * every raw resource into the focused cell's warehouse so a tester can
 * actually exercise the construction flow without first standing up
 * extractors → energy → biomass. The build flow itself is untouched:
 * `consumeRecipe` still runs, the task queue still gates, the recipe
 * still has to be present in the warehouse. We are gifting inputs, not
 * skipping the path.
 *
 * Sized at GIFT_AMOUNT per resource (5 × 6 resources = 30 unit-slots
 * worst case, comfortably below the 20-unit warehouse — the call clips
 * to available space, so over-allocation is safe).
 *
 * Mirrors BloomDevControls in shape and styling so the inspector keeps
 * one visual language for dev affordances.
 */
import { type Cell, ResourceName } from "./types"
import { useAppDispatch } from "@/app/hooks"
import { addToWarehouse } from "./cellSlice"
import { Button } from "@/components/ui/button"

const GIFT_AMOUNT = 25

interface Props {
  cell: Cell
}

export const EconomyDevControls = ({ cell }: Props) => {
  const dispatch = useAppDispatch()

  const giftResources = () => {
    for (const resource of Object.values(ResourceName)) {
      dispatch(
        addToWarehouse({ cellId: cell.id, resource, quantity: GIFT_AMOUNT }),
      )
    }
  }

  return (
    <div className="mt-2 mx-4 mb-3 rounded-md ring-1 ring-fuchsia-400/30 bg-fuchsia-500/5 px-3 py-2">
      <div className="text-[10px] uppercase tracking-[0.2em] text-fuchsia-300/80">
        Economy · dev
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="mt-2 h-7 text-xs text-fuchsia-200 hover:text-fuchsia-100 hover:bg-fuchsia-500/10"
        onClick={giftResources}
      >
        + Gift resources ({GIFT_AMOUNT.toString()} of each)
      </Button>
    </div>
  )
}
