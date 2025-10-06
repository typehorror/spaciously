import { type Cell } from "@/features/cell/types"
import { WarehouseUnit } from "./WarehouseStorage"
import { useAppSelector } from "@/app/hooks"
import { selectBuildingByCellId } from "@/features/building/buildingSlice"
import { flatMap, range, uniqBy } from "lodash"
import { ProductionUnit } from "./ProductionUnit"
import { NewBuildingButton } from "./NewBuildingButton"
import { CreatedBuildingButton } from "./CreatedBuildingButton"

interface Props {
  cell: Cell
}

const renderQty = (qty?: number) => (qty ?? 0).toLocaleString()

export const DevelopedCellPanel = ({ cell }: Props) => {
  const { warehouse, habitat } = cell
  const buildings = useAppSelector(state =>
    selectBuildingByCellId(state, cell.id),
  )

  // get all the resources the buildings produce
  const production = uniqBy(
    flatMap(buildings, b => b.production),
    "name",
  )

  return (
    <div className="flex flex-col h-full p-6 overflow-auto">
      <div className="mb-4">
        <h4 className="font-medium mb-2">Habitation</h4>
        <div className="text-sm">
          Population: {renderQty(habitat.population)} /{" "}
          {renderQty(habitat.capacity)}
        </div>
      </div>

      <WarehouseUnit className="mb-4" warehouse={warehouse} />
      <div className="mb-4">
        <h4 className="font-medium mb-2">Production</h4>
        {production.map(prod => (
          <ProductionUnit key={prod.name} product={prod} cellId={cell.id} />
        ))}
      </div>

      <div className="mb-4">
        <h4 className="font-medium mb-2">Buildings</h4>
        <div className="grid grid-cols-2 gap-4">
          {range(0, cell.slots).map(slotIndex => {
            const building = buildings.find(b => b.slotIndex === slotIndex)

            return (
              <div key={slotIndex} className="mb-2">
                {building ? (
                  <CreatedBuildingButton
                    building={building}
                    cell={cell}
                    slotIndex={slotIndex}
                  />
                ) : (
                  <NewBuildingButton slotIndex={slotIndex} cell={cell} />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default DevelopedCellPanel
