import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "./ui/button"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import {
  selectAvailableResearches,
  unlockResearch,
} from "@/features/research/researchSlice"

export const ResearchButton: React.FC = () => {
  const available = useAppSelector(state => selectAvailableResearches(state))
  const dispatch = useAppDispatch()

  return (
    <Dialog>
      <DialogTrigger>
        <Button variant="outline" size="sm">
          Research
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Available Researches</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </DialogDescription>
          <div className="space-y-3">
            <div>
              <div className="mt-2 grid gap-2">
                {available.length === 0 && (
                  <div className="text-sm text-muted-foreground">
                    No research available
                  </div>
                )}
                {available.map(r => (
                  <div
                    key={r.id}
                    className="p-3 border cursor-pointer hover:bg-gray-400/10 rounded-md hover:border-gray-500 flex justify-between items-center"
                    role="button"
                    onClick={() => dispatch(unlockResearch(r.id))}
                  >
                    <div>
                      <div className="font-medium text-white">{r.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {r.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
