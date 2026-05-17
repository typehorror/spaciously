/**
 * UnoccupiedCellInformation
 *
 * Inspector for an unclaimed hex. Shows the cell's coordinates, a short
 * primer note, and a per-resource breakdown — hidden behind "unknown" until
 * the cell is adjacent to a claimed one. From here the player can spend the
 * terraform recipe to convert the cell to a developed state.
 */
import { resourceColor } from "@/features/resources/resources"
import { ResourceName } from "@/features/resources/types"
import { range } from "lodash"
import { HexCellState, type Cell } from "@/features/cell/types"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import {
  consumeRecipe,
  getMissingProductForRecipe,
  selectHasClaimedNeighbor,
  terraformCell,
  terraformRecipe,
} from "@/features/cell/cellSlice"
import { Button } from "./ui/button"
import { addTask, selectTaskById } from "@/features/task/taskSlice"
import { TaskBarProgress } from "./ui/taskProgress"
import { toast } from "sonner"
import { CellHeader, ConsoleSection } from "./CellInspectorChrome"
import { CompassIcon, NotebookTextIcon, SparklesIcon } from "lucide-react"

interface Props {
  cell: Cell
}

export const UnoccupiedCellInformation = ({ cell }: Props) => {
  const dispatch = useAppDispatch()
  const terraformingTask = useAppSelector(state =>
    selectTaskById(state, `${cell.id}:terraforming`),
  )
  const isDiscovered = useAppSelector(state =>
    selectHasClaimedNeighbor(state, cell.id),
  )

  const onDiscoverClick = () => {
    const missingResource = getMissingProductForRecipe(
      cell.warehouse,
      terraformRecipe,
    )
    if (missingResource) {
      toast(`Cannot Terraform. Not enough ${missingResource} in warehouse.`)
      return
    }
    dispatch(consumeRecipe({ cellId: cell.id, recipe: terraformRecipe }))
    dispatch(
      addTask({
        id: `${cell.id}:terraforming`,
        description: "Terraforming",
        action: terraformCell({ cellId: cell.id }),
        duration: 6,
        energyUsage: 5_000,
        isContinuous: false,
      }),
    )
  }

  // Belt-and-braces: this component is intended for unclaimed cells only;
  // crash visibly if the inspector routes a developed cell here.
  if (cell.state === HexCellState.DEVELOPED) {
    return (
      <div className="flex-1 flex items-center justify-center text-white/40 p-6">
        <p>This cell is already claimed.</p>
      </div>
    )
  }

  function renderResourceBar(blocks: number, resource: ResourceName) {
    return (
      <div className="flex items-center gap-1">
        {range(0, blocks).map(index => (
          <div
            key={index}
            className={`${resourceColor[resource]} h-3 w-3 border border-white/10 rounded-xs`}
          />
        ))}
      </div>
    )
  }

  const renderTerraformButton = () => {
    if (terraformingTask?.startedAt) {
      return (
        <TaskBarProgress
          {...terraformingTask}
          startedAt={terraformingTask.startedAt}
          label="Terraforming in progress..."
          duration={terraformingTask.duration * 1_000}
        />
      )
    }
    return (
      <Button
        size="default"
        className="w-full bg-amber-500/10 border-amber-400/30 text-amber-200 hover:bg-amber-500/20 hover:text-amber-100"
        variant="outline"
        onClick={onDiscoverClick}
      >
        <SparklesIcon className="w-4 h-4" />
        Terraform Area
      </Button>
    )
  }

  return (
    <div className="flex flex-col h-full p-5 gap-5">
      <CellHeader
        label={isDiscovered ? "Surveyed Area" : "Unsurveyed Area"}
        coord={{ q: cell.q, r: cell.r }}
        accent={isDiscovered ? "amber" : "cyan"}
      />

      <ConsoleSection title="Notes" icon={NotebookTextIcon}>
        <p className="text-xs text-white/55 leading-relaxed">
          {isDiscovered
            ? "Adjacent to a claimed cell. Resource estimates available — terraform to establish an outpost."
            : "This hex is outside scanner range. Claim an adjacent cell to reveal its resource profile."}
        </p>
      </ConsoleSection>

      <ConsoleSection
        title="Resources"
        icon={CompassIcon}
        meta={isDiscovered ? "surveyed" : "unknown"}
      >
        <div className="space-y-1">
          {Object.entries(ResourceName).map(([key, resourceName]) => (
            <div
              key={key}
              className="flex text-sm justify-between items-center py-1.5 border-b border-white/5 last:border-b-0"
            >
              <span className="capitalize font-light text-white/60">
                {resourceName}
              </span>
              <span>
                {isDiscovered ? (
                  renderResourceBar(cell.resources[resourceName], resourceName)
                ) : (
                  <span className="text-white/30 text-xs italic">unknown</span>
                )}
              </span>
            </div>
          ))}
        </div>
      </ConsoleSection>

      {isDiscovered && (
        <div className="mt-auto pt-2">{renderTerraformButton()}</div>
      )}
    </div>
  )
}

export default UnoccupiedCellInformation
