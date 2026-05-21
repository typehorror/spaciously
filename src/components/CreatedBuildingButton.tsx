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
import { selectPatientZeroBuildingId } from "@/features/infection/infectionSlice"
import { BiohazardIcon } from "lucide-react"

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
  const patientZeroBuildingId = useAppSelector(selectPatientZeroBuildingId)
  const isPatientZero = patientZeroBuildingId === building.id

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
          className={`relative flex justify-center items-center flex-col gap-1 w-full h-32 rounded-md bg-white/[0.03] border text-white/80 transition ${
            isPatientZero
              ? "border-fuchsia-400/60 hover:border-fuchsia-300 hover:bg-fuchsia-500/10"
              : "border-white/10 hover:border-cyan-400/50 hover:bg-cyan-400/5"
          }`}
          aria-label={
            isPatientZero
              ? `${building.name} — patient zero`
              : building.name
          }
        >
          {isPatientZero && (
            <span
              className="absolute top-1.5 right-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-fuchsia-500/20 ring-1 ring-fuchsia-400/60"
              title="Patient zero — the Bloom hosted here first."
              aria-hidden
            >
              <BiohazardIcon className="w-3 h-3 text-fuchsia-200" />
            </span>
          )}
          <div className="font-semibold text-white">{building.name}</div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-cyan-300/60">
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
