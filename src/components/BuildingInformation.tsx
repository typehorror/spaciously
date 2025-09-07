import { useAppSelector } from "@/app/hooks"
import { getBuildingById } from "@/features/building/buildingSlice"
import { type Cell } from "@/features/cell/types"
import { getProductionUnitsByCellId } from "@/features/production/productionSlice"
import { ProductionUnit } from "./ProductionUnit"
import { getWarehouse } from "@/features/warehouse/warehouseSlice"
import { type Warehouse } from "@/features/warehouse/types"
import { getStorageUnits } from "@/features/warehouse/utils"
import { backgroundColor } from "@/features/resources/resources"
import { range } from "lodash"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const renderQty = (qty?: number) => (qty ?? 0).toLocaleString()

function renderCost(cost?: Record<string, number>) {
  if (!cost || Object.keys(cost).length === 0) return <span>—</span>
  return (
    <div className="flex gap-2 flex-wrap">
      {Object.entries(cost).map(([k, v]) => (
        <div key={k} className="text-xs text-muted-foreground">
          {k}: {v}
        </div>
      ))}
    </div>
  )
}

type Props = {
  cell: Cell
}

export const BuildingInformation = ({ cell }: Props) => {
  const building = useAppSelector(state => getBuildingById(state, cell.id))
  const productionUnits = useAppSelector(state =>
    getProductionUnitsByCellId(state, cell),
  )
  const warehouse = useAppSelector(state => getWarehouse(state, cell.id))

  if (!building) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <p>No building on this cell</p>
      </div>
    )
  }

  const renderPoints = (points: number, resource: string, index: number) => {
    const filledPoints = range(0, points).map(i => (
      <div
        key={`${index.toString()}-point-${i.toString()}-${resource}`}
        className={`${backgroundColor[resource] ?? "bg-gray-600"} w-1 h-1 rounded-[1px]`}
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
    // console.log(units)
    return units.map((unit, index) => (
      <Tooltip key={`unit-${unit.resource}-${index}`}>
        <TooltipTrigger>
          <div className={`inline-block border-gray-700 mr-1`}>
            <div className="w-3 gap-0.5 grid grid-cols-2 p-px">
              {renderPoints(unit.quantity, unit.resource, index)}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {unit.resource
              ? `${(warehouse.content[unit.resource] ?? "0").toString()} ${unit.resource}`
              : "Empty"}
          </p>
        </TooltipContent>
      </Tooltip>
    ))
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
          Population: {renderQty(building.habitat.population)} /{" "}
          {renderQty(building.habitat.capacity)}
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

      <div className="mb-4">
        <h4 className="font-medium mb-2">Maintenance</h4>
        <div className="space-y-2">
          {building.maintenance.map((m, i) => (
            <div
              key={i}
              className="flex justify-between items-center text-sm border-b border-gray-500/30 py-2"
            >
              <div>
                <div className="font-medium">{m.resource}</div>
                <div className="text-xs text-muted-foreground">
                  Qty: {m.quantity} — every {m.period}s
                </div>
              </div>
              <div className="text-right text-xs">
                Multiplier: {JSON.stringify(m.multiplier)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <h4 className="font-medium mb-2">Expansions</h4>
        <div className="space-y-3">
          {building.expansion.map((e, i) => (
            <div key={i} className="p-3 border rounded-md">
              <div className="font-medium">
                {e.name} (Lvl {e.level})
              </div>
              <div className="text-sm text-muted-foreground">
                {e.description}
              </div>
              <div className="mt-2 text-xs">Cost: {renderCost(e.cost)}</div>
              {e.modifier.production && (
                <div className="mt-2 text-xs">
                  <div className="font-medium">Adds Production:</div>
                  {e.modifier.production.map((p, j) => (
                    <div key={j} className="text-xs text-muted-foreground">
                      {p.resource}: {p.quantity}
                      {p.period ? ` every ${p.period.toString()}s` : ""}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default BuildingInformation
