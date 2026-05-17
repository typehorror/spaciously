/**
 * WarehouseStorage
 *
 * Renders a cell's warehouse as a row of small storage-unit chips, one per
 * unit of capacity. Hovering any unit reveals its resource and quantity in
 * the section header (with a small debounce so the reveal doesn't flicker
 * as the cursor sweeps across the row).
 *
 * Public API: <WarehouseUnit warehouse={Warehouse} />
 */
import { type Warehouse } from "@/features/cell/types"
import { getStorageUnits } from "@/features/cell/utils"
import { WarehouseStorageUnit } from "./WarehouseStorageUnit"
import { useRef, useState } from "react"
import { ConsoleSection } from "./CellInspectorChrome"
import { WarehouseIcon } from "lucide-react"

interface Props {
  warehouse: Warehouse
}

const renderQty = (qty?: number) => (qty ?? 0).toLocaleString()

export const WarehouseUnit = ({ warehouse }: Props) => {
  const units = getStorageUnits(warehouse)
  const [hoverResourceName, _setHoverResourceName] = useState<string>("")
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null)

  const setHoverResourceName = (name: string) => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current)
    }
    debounceTimeout.current = setTimeout(
      () => {
        _setHoverResourceName(name)
      },
      name === "" ? 300 : 0,
    )
  }

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
        className="inline-block mr-1"
        key={key}
        onMouseEnter={handleMouseEnter(
          resourceName ? `${resourceName}: ${qty.toString()}` : "Empty",
        )}
        onMouseLeave={handleMouseLeave}
      >
        <div className="w-4 gap-0.5 grid grid-cols-2 p-0.5 hover:border-cyan-400/60 hover:bg-cyan-400/10 border border-transparent rounded-xs">
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
    <ConsoleSection
      title="Warehouse"
      icon={WarehouseIcon}
      meta={
        hoverResourceName ? (
          <span className="text-white/70">{hoverResourceName}</span>
        ) : (
          `Cap. ${renderQty(warehouse.capacity)}`
        )
      }
    >
      <div className="text-sm leading-relaxed">{nodes}</div>
    </ConsoleSection>
  )
}
