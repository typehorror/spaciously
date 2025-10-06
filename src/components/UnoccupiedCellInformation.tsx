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
        duration: 6, // 60 seconds
        energyUsage: 5_000, // 5 energy units per second
        isContinuous: false,
      }),
    )
  }

  // This component is intended for unclaimed / unoccupied cells
  if (cell.state === HexCellState.DEVELOPED) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <p>This cell is already claimed.</p>
      </div>
    )
  }

  function renderResourceBar(blocks: number, resource: ResourceName) {
    return (
      <div className="flex items-center">
        {range(0, blocks).map(index => (
          <div
            key={index}
            className={`${resourceColor[resource]} h-4 w-4 ml-1 border rounded-sm`}
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
    } else {
      return (
        <Button
          size="default"
          className="mt-2 block w-full"
          variant="outline"
          onClick={onDiscoverClick}
        >
          Terraform Area
        </Button>
      )
    }
  }

  return (
    <div className="flex flex-col h-full p-6">
      <div className="border-b pb-4 mb-4">
        <h3 className="text-lg font-semibold">Unoccupied Area</h3>
        <p className="text-sm text-muted-foreground">
          Coordinates: ({cell.q}, {cell.r})
        </p>
      </div>

      <div className="mb-4">
        <h4 className="font-medium mb-2">Notes</h4>
        <p className="text-sm text-muted-foreground">
          This hex is unclaimed. You can establish an outpost here to harvest
          resources and expand your colony.
        </p>
      </div>

      <div className="flex-1 mt-4">
        <h4 className="font-medium mb-3">Resources (estimated)</h4>
        <div className="space-y-2 font-small">
          {Object.entries(ResourceName).map(([key, resourceName]) => (
            <div
              key={key}
              className="flex text-sm justify-between items-center border-b border-gray-500/50 py-2"
            >
              <span className="capitalize font-light text-gray-400">
                {resourceName}
              </span>
              <span>
                {isDiscovered ? (
                  renderResourceBar(cell.resources[resourceName], resourceName)
                ) : (
                  <span className="text-gray-400">unknown</span>
                )}
              </span>
            </div>
          ))}
        </div>
        {isDiscovered && (
          <div className="flex items-center h-12">
            {renderTerraformButton()}
          </div>
        )}
      </div>
    </div>
  )
}

export default UnoccupiedCellInformation
