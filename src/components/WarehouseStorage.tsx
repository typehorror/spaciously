import { type Warehouse } from "@/features/cell/types"
import { getStorageUnits } from "@/features/cell/utils"
import { WarehouseStorageUnit } from "./WarehouseStorageUnit"
import { useState } from "react"

interface Props {
  warehouse: Warehouse
  className?: string
}

const renderQty = (qty?: number) => (qty ?? 0).toLocaleString()

export const WarehouseUnit = ({ warehouse, className }: Props) => {
  const units = getStorageUnits(warehouse)
  const [hoverResourceName, setHoverResourceName] = useState<string>("")

  const handleMouseEnter = (resourceName: string) => () => {
    setHoverResourceName(resourceName)
  }

  const handleMouseLeave = () => {
    setHoverResourceName("")
  }

  const nodes = units.map((unit, index) => {
    const resKey = unit.resource ?? `empty-${index.toString()}`
    const key = `unit-${resKey}-${index.toString()}`
    const resourceName = unit.resource ?? ""
    const qty = unit.resource ? (warehouse.content[unit.resource] ?? 0) : 0

    return (
      <div
        className={`inline-block mr-1`}
        key={key}
        onMouseEnter={handleMouseEnter(
          resourceName ? `${resourceName}: ${qty.toString()}` : "Empty",
        )}
        onMouseLeave={handleMouseLeave}
      >
        <div className="w-4 gap-0.5 grid grid-cols-2 p-0.5 hover:border-gray-500/70 border border-transparent rounded-xs">
          <WarehouseStorageUnit
            points={unit.quantity}
            resource={resourceName}
            index={index}
          />
        </div>
      </div>
    )
  })

  return (
    <div className={className}>
      <h4 className="font-medium mb-2 flex flex-between items-end">
        <div className="flex-1">
          <span>Warehouse</span>
          {hoverResourceName && (
            <span className="text-sm text-gray-400 ml-4">
              {hoverResourceName}
            </span>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          Cap. {renderQty(warehouse.capacity)}
        </div>
      </h4>
      <div className="mt-2 text-sm">
        <div className="mt-1">{nodes}</div>
      </div>
    </div>
  )
}
