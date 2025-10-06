import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { CuboidIcon, PlusIcon } from "lucide-react"
import { addBuilding } from "@/features/building/buildingSlice"
import { type Building, type ProductRecipe } from "@/features/production/types"
import { useState } from "react"
import { addTask, getTaskById } from "@/features/task/taskSlice"
import { TaskCircleProgress } from "./ui/taskProgress"
import { TaskState } from "@/features/task/types"
import { selectAllAvailableBuildings } from "@/features/production/selector"
import { toast } from "sonner"
import {
  consumeRecipe,
  getMissingProductForRecipe,
} from "@/features/cell/cellSlice"
import { type Cell } from "@/features/cell/types"

interface Props {
  cell: Cell
  slotIndex: number
}

export const NewBuildingButton: React.FC<Props> = ({ cell, slotIndex }) => {
  const cellId = cell.id
  const available = useAppSelector(state => selectAllAvailableBuildings(state))
  const buildingTask = useAppSelector(state =>
    getTaskById(state, `${cellId}:BUILDING:${slotIndex.toString()}`),
  )

  const dispatch = useAppDispatch()
  const [open, setOpen] = useState(false)

  const renderRecipeInputs = (recipe: ProductRecipe) => {
    return recipe.inputs.map(input => (
      <div key={input.product} className="flex items-center space-x-2">
        <CuboidIcon size={16} className="text-gray-400" />
        <span>{input.quantity}</span>
      </div>
    ))
  }

  if (
    buildingTask &&
    buildingTask.state !== TaskState.COMPLETED &&
    buildingTask.startedAt
  ) {
    return (
      <TaskCircleProgress
        startedAt={buildingTask.startedAt}
        duration={buildingTask.duration * 1_000}
        state={buildingTask.state}
        label={buildingTask.description}
      />
    )
  }

  const constructBuilding = (building: Building) => {
    const missingResource = getMissingProductForRecipe(
      cell.warehouse,
      building.recipe,
    )

    if (missingResource) {
      toast(
        `Cannot construct ${building.name}. Not enough ${missingResource} in warehouse.`,
      )
      return
    }
    dispatch(consumeRecipe({ cellId: cell.id, recipe: building.recipe }))
    dispatch(
      addTask({
        id: `${cellId}:BUILDING:${slotIndex.toString()}`,
        description: `Constructing ${building.name}`,
        duration: building.recipe.buildTime,
        energyUsage: building.recipe.energy,
        action: addBuilding({
          cellId,
          slotIndex,
          building,
        }),
      }),
    )
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
                    No Constructions available
                  </div>
                )}
                {available.map(building => (
                  <div
                    key={building.name}
                    className="p-3 border cursor-pointer hover:bg-gray-400/10 rounded-md hover:border-gray-500 flex justify-between items-center"
                    role="button"
                    onClick={() => constructBuilding(building)}
                  >
                    <div>
                      <div className="font-medium text-white">
                        {building.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {building.description}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {renderRecipeInputs(building.recipe)}
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
