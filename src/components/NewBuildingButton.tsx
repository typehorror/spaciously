import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import {
  selectAvailableResearches,
  unlockResearch,
} from "@/features/research/researchSlice"
import { PlusIcon } from "lucide-react"

export const NewBuildingButton: React.FC = () => {
  const available = useAppSelector(state => selectAvailableResearches(state))
  const dispatch = useAppDispatch()

  return (
    <Dialog>
      <DialogTrigger className="flex justify-center items-center flex-col gap-1 w-full h-32 rounded-md border-white/20 border hover:border-solid hover:border-white/40 border-dashed text-gray-500 hover:text-gray-200 hover:bg-white/5 transition">
        <PlusIcon size={24} />
        <span> Build</span>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Available Constructions</DialogTitle>
          <DialogDescription></DialogDescription>
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
