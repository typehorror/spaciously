import type React from "react"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import {
  getAvailableResearch,
  getResearched,
  unlockResearch,
} from "@/features/research/researchSlice"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export const ResearchPanel: React.FC = () => {
  const dispatch = useAppDispatch()
  const available = useAppSelector(state => getAvailableResearch(state))
  const researched = useAppSelector(state => getResearched(state))

  return (
    <div className="mb-4">
      <h4 className="font-medium mb-2">Research</h4>
      <div className="space-y-3">
        <div>
          <div className="font-medium">Available</div>
          <div className="mt-2 grid gap-2">
            {available.length === 0 && (
              <div className="text-sm text-muted-foreground">
                No research available
              </div>
            )}
            {available.map(r => (
              <div
                key={r.id}
                className="p-3 border rounded-md flex justify-between items-center"
              >
                <div>
                  <div className="font-medium">{r.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {r.description}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="btn btn-sm"
                    onClick={() => dispatch(unlockResearch(r.id))}
                  >
                    Unlock
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="font-medium">Researched</div>
          <div className="mt-2 grid gap-2">
            {researched.length === 0 && (
              <div className="text-sm text-muted-foreground">
                No research completed
              </div>
            )}
            {researched.map(r => (
              <Tooltip key={r.id}>
                <TooltipTrigger>
                  <div className="p-2 border rounded-md text-sm">{r.name}</div>
                </TooltipTrigger>
                <TooltipContent className="pointer-events-none">
                  <div className="text-xs">{r.description}</div>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResearchPanel
