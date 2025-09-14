import { resourceColor } from "@/features/resources/resources"
import { ResourceName } from "@/features/resources/types"
import { hasClaimedNeighbor } from "@/features/map/utils"
import { range } from "lodash"
import { type Cell } from "@/features/cell/types"
import { useAppSelector } from "@/app/hooks"
import { selectCellEntities } from "@/features/cell/cellSlice"

type Props = {
  cell: Cell
}

export const UnoccupiedCellInformation = ({ cell }: Props) => {
  const cellIndex = useAppSelector(selectCellEntities)

  // This component is intended for unclaimed / unoccupied cells
  if (cell.state === "claimed") {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <p>This cell is already claimed.</p>
      </div>
    )
  }

  const isDiscovered = hasClaimedNeighbor(cell.id, cellIndex)

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
      </div>
    </div>
  )
}

export default UnoccupiedCellInformation
