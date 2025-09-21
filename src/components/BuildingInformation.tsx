import { useAppSelector } from "@/app/hooks"
import { selectBuildingById } from "@/features/building/buildingSlice"
import { type Cell } from "@/features/cell/types"
import { selectProductionUnitsByCellId } from "@/features/production/productionSlice"
import { ProductionUnit } from "./ProductionUnit"
import { selectWarehouseById } from "@/features/warehouse/warehouseSlice"
import { type Warehouse } from "@/features/warehouse/types"
import { getStorageUnits } from "@/features/warehouse/utils"
import { backgroundColor } from "@/features/resources/resources"
import type { ResourceName } from "@/features/resources/types"
import { range } from "lodash"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { selectHabitatById } from "@/features/habitat/habitatSlice"

const renderQty = (qty?: number) => (qty ?? 0).toLocaleString()

type Props = {
  cell: Cell
}

export const BuildingInformation = ({ cell }: Props) => {
  const building = useAppSelector(state => selectBuildingById(state, cell.id))
  const productionUnits = useAppSelector(state =>
    selectProductionUnitsByCellId(state, cell),
  )
  const warehouse = useAppSelector(state => selectWarehouseById(state, cell.id))
  const habitat = useAppSelector(state => selectHabitatById(state, cell.id))

  // BuildingInformation is only rendered for cells with a building, so
  // we assume `building` is present here.

  const renderPoints = (
    points: number,
    resource: ResourceName | string,
    index: number,
  ) => {
    const colorClass =
      resource in backgroundColor
        ? backgroundColor[resource as ResourceName]
        : "bg-gray-600"

    const filledPoints = range(0, points).map(i => (
      <div
        key={`${index.toString()}-point-${i.toString()}-${resource}`}
        className={`${colorClass} w-1 h-1 rounded-[1px]`}
      ></div>
    ))
    const emptyPoints = range(filledPoints.length, 8).map(i => (
      <div
        key={`${index.toString()}-point-${i.toString()}-${resource}`}
        className={`bg-gray-500/40 w-1 h-1 rounded-[1px]`}
      ></div>
    ))
    return (
      <>
        {filledPoints}
        {emptyPoints}
      </>
    )
  }

  const renderWarehouseContent = (warehouse?: Warehouse) => {
    if (!warehouse) {
      return <span>Empty</span>
    }
    const units = getStorageUnits(warehouse)

    const nodes = units.map((unit, index) => {
      const resKey = unit.resource ?? `empty-${index.toString()}`
      const key = `unit-${resKey}-${index.toString()}`
      const resourceName = unit.resource ?? ""
      const qty = unit.resource ? (warehouse.content[unit.resource] ?? 0) : 0

      return (
        <Tooltip key={key}>
          <TooltipTrigger>
            <div className={`inline-block mr-1`}>
              <div className="w-4 gap-0.5 grid grid-cols-2 p-0.5 hover:border-gray-500/70 border border-transparent rounded-xs">
                {renderPoints(unit.quantity, resourceName, index)}
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent className="pointer-events-none">
            <p>
              {unit.resource ? `${qty.toString()} ${unit.resource}` : "Empty"}
            </p>
          </TooltipContent>
        </Tooltip>
      )
    })

    return nodes
  }

  return (
    <div className="flex flex-col h-full p-6 overflow-auto">
      <div className="border-b pb-4 mb-4">
        <h3 className="text-lg font-semibold">{building.name}</h3>
        <p className="text-sm text-muted-foreground">Level {building.level}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          {building.description}
        </p>
      </div>

      <div className="mb-4">
        <h4 className="font-medium mb-2">Habitation</h4>
        <div className="text-sm">
          Population: {renderQty(habitat.population)} /{" "}
          {renderQty(habitat.capacity)}
        </div>
      </div>

      <div className="mb-4">
        <h4 className="font-medium mb-2 flex flex-between items-end">
          <span className="flex-1">Warehouse</span>
          <div className="text-sm text-muted-foreground">
            Cap. {renderQty(building.warehouse.capacity)}
          </div>
        </h4>
        <div className="mt-2 text-sm">
          <div className="mt-1">{renderWarehouseContent(warehouse)}</div>
        </div>
      </div>

      <div className="mb-4">
        <h4 className="font-medium mb-2">Production</h4>
        <div className="space-y-2">
          {productionUnits.map(unit => (
            <ProductionUnit production={unit} key={unit.name} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default BuildingInformation
