import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { CheckIcon, CuboidIcon } from "lucide-react"
import {
  fixBuilding,
  type CreatedBuilding,
} from "@/features/building/buildingSlice"
import { type ProductRecipe } from "@/features/production/types"
import { useState } from "react"
import { addTask, getTaskById } from "@/features/task/taskSlice"
import { TaskCircleProgress } from "./ui/taskProgress"
import { TaskState } from "@/features/task/types"
import { HealthBar } from "./ui/healthBar"
import {
  consumeRecipe,
  getMissingProductForRecipe,
} from "@/features/cell/cellSlice"
import { type Cell } from "@/features/cell/types"
import { toast } from "sonner"

interface Props {
  cell: Cell
  slotIndex: number
  building: CreatedBuilding
}

export const CreatedBuildingButton: React.FC<Props> = ({
  cell,
  slotIndex,
  building,
}) => {
  const cellId = cell.id
  const taskId = `${cellId}:BUILDING:${slotIndex.toString()}`
  const repairTask = useAppSelector(state => getTaskById(state, taskId))

  const dispatch = useAppDispatch()
  const [open, setOpen] = useState(false)
  const healthRatio = building.health / building.maxHealth

  const renderRecipeInputs = (recipe: ProductRecipe) => {
    return recipe.inputs.map(input => (
      <div key={input.product} className="flex items-center space-x-2">
        <CuboidIcon size={16} className="text-gray-400" />
        <span>{Math.ceil(input.quantity * (1 - healthRatio))}</span>
      </div>
    ))
  }

  if (
    repairTask &&
    repairTask.state !== TaskState.COMPLETED &&
    repairTask.startedAt
  ) {
    return (
      <TaskCircleProgress
        startedAt={repairTask.startedAt}
        duration={repairTask.duration * 1_000}
        state={repairTask.state}
        label={repairTask.description}
      />
    )
  }

  const repairBuilding = () => {
    const missingResource = getMissingProductForRecipe(
      cell.warehouse,
      building.recipe,
      1 - healthRatio,
    )

    if (missingResource) {
      toast(
        `Cannot repair ${building.name}. Not enough ${missingResource} in warehouse.`,
      )
      return
    }

    dispatch(
      consumeRecipe({
        cellId: cell.id,
        recipe: building.recipe,
        ratio: 1 - healthRatio,
      }),
    )
    dispatch(
      addTask({
        id: taskId,
        description: `Fixing ${building.name}`,
        duration: building.recipe.buildTime * (1 - healthRatio),
        energyUsage: building.recipe.energy,
        action: fixBuilding({
          id: building.id,
          health: building.maxHealth - building.health,
        }),
      }),
    )
    setOpen(false)
  }

  const renderRepairButton = () => {
    return (
      <div
        className="p-3 border cursor-pointer hover:bg-gray-400/10 rounded-md hover:border-gray-500 flex justify-between items-center"
        role="button"
        onClick={repairBuilding}
      >
        <div>
          <div className="font-medium text-white">Repair {building.name}</div>
          <div className="text-xs text-muted-foreground">
            Restore {building.maxHealth - building.health} HP
          </div>
        </div>
        <div className="flex space-x-2">
          {renderRecipeInputs(building.recipe)}
        </div>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex justify-center items-center flex-col gap-1 w-full h-32 rounded-md border-white/20 border-2 hover:border-green-600 text-gray-500 hover:bg-green-950/50 transition"
        >
          <div className="font-semibold text-white">{building.name}</div>
          <div className="text-sm text-muted-foreground">
            Level {building.level}
          </div>
          {building.health < building.maxHealth && (
            <HealthBar
              value={building.health}
              maxValue={building.maxHealth}
              className="w-3/4 mt-1"
            />
          )}
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{building.name}</DialogTitle>
          <DialogDescription>{building.description}</DialogDescription>
          <div className="space-y-3">
            <div>
              <div className="mt-2 grid gap-2">
                {building.health < building.maxHealth ? (
                  renderRepairButton()
                ) : (
                  <div className="text-sm text-muted-foreground">
                    <CheckIcon size={16} className="inline mr-1" />
                    Building is fully operational
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
