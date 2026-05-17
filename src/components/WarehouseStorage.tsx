/**
 * WarehouseStorage
 *
 * Renders a cell's warehouse as a row of small storage-unit chips, one per
 * unit of capacity. Hovering any unit reveals the warehouse-wide total for
 * that resource in the section header (with a small debounce so the reveal
 * doesn't flicker as the cursor sweeps across the row).
 *
 * Reads `warehouse.units` directly — the typed array is the source of truth
 * (see ADR-0001) — but groups units by resource for display so each
 * resource reads as a contiguous series rather than interleaving. The
 * underlying state order is unchanged; this is presentation-only.
 *
 * Buffer units carry a persistent outline so their ownership is visible at
 * a glance: cyan while the production is running (with the in-flight block
 * pulsing inside), amber when the production is halted because the buffer
 * is full. The running/halted distinction comes from
 * `selectRunningProductionOrders`, the same source the ticker and energy
 * selector use — no parallel derivation.
 *
 * Public API: <WarehouseUnit warehouse={Warehouse} cellId={string} />
 */
import { type StorageUnitState, type Warehouse } from "@/features/cell/types"
import { WAREHOUSE_UNIT_CAPACITY } from "@/config"
import { WarehouseStorageUnit } from "./WarehouseStorageUnit"
import { useMemo, useRef, useState } from "react"
import { ConsoleSection } from "./CellInspectorChrome"
import { WarehouseIcon } from "lucide-react"
import { useAppSelector } from "@/app/hooks"
import { selectAllRunningProductionOrders } from "@/features/production/productionSlice"
import { getResourceQuantity } from "@/features/cell/warehouse"

interface Props {
  warehouse: Warehouse
  cellId: string
}

const renderQty = (qty?: number) => (qty ?? 0).toLocaleString()

const describeUnit = (
  unit: StorageUnitState,
  resourceTotal: number,
): string => {
  switch (unit.type) {
    case "empty":
      return "Empty"
    case "stored":
      return `${unit.resource}: ${resourceTotal.toLocaleString()}`
    case "buffer":
      return `${unit.resource} (${unit.productName}): ${resourceTotal.toLocaleString()}`
  }
}

// Display order: each resource forms a contiguous run, stored units first,
// then the buffer (the active filling spot reads as the rightmost of its
// group). Empty units land at the end. Resources appear in the order they
// first show up in the underlying array — keeps the layout stable as
// content shifts.
interface IndexedUnit {
  unit: StorageUnitState
  originalIndex: number
}

const displayOrder = (units: StorageUnitState[]): IndexedUnit[] => {
  const empties: IndexedUnit[] = []
  const grouped = new Map<string, IndexedUnit[]>()
  const resourceOrder: string[] = []

  units.forEach((unit, originalIndex) => {
    if (unit.type === "empty") {
      empties.push({ unit, originalIndex })
      return
    }
    if (!grouped.has(unit.resource)) {
      grouped.set(unit.resource, [])
      resourceOrder.push(unit.resource)
    }
    grouped.get(unit.resource)?.push({ unit, originalIndex })
  })

  const result: IndexedUnit[] = []
  for (const resource of resourceOrder) {
    const group = grouped.get(resource) ?? []
    const stored = group.filter(g => g.unit.type === "stored")
    const buffer = group.filter(g => g.unit.type === "buffer")
    result.push(...stored, ...buffer)
  }
  result.push(...empties)
  return result
}

// Outline classes per storage-unit variant. The blink animation lives at
// the per-block level inside WarehouseStorageUnit, not on the unit wrapper:
// a half-filled buffer shouldn't pulse its already-stored blocks, only the
// one currently being produced into.
const variantClasses = (
  unit: StorageUnitState,
  isRunning: boolean,
): string => {
  if (unit.type !== "buffer") {
    return "border-transparent hover:border-cyan-400/60 hover:bg-cyan-400/10"
  }
  return isRunning
    ? "border-cyan-400/60 bg-cyan-400/5"
    : "border-amber-400/60 bg-amber-400/10"
}

export const WarehouseUnit = ({ warehouse, cellId }: Props) => {
  const runningOrders = useAppSelector(selectAllRunningProductionOrders)
  const runningProductNames = useMemo(
    () =>
      new Set(
        runningOrders.filter(o => o.cellId === cellId).map(o => o.productName),
      ),
    [runningOrders, cellId],
  )

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

  const handleMouseEnter = (label: string) => () => {
    setHoverResourceName(label)
  }
  const handleMouseLeave = () => {
    setHoverResourceName("")
  }

  const ordered = useMemo(() => displayOrder(warehouse.units), [warehouse.units])

  const nodes = ordered.map(({ unit, originalIndex }) => {
    const resourceName = unit.type === "empty" ? "" : unit.resource
    const quantity = unit.type === "empty" ? 0 : unit.quantity
    const key = `unit-${unit.type}-${resourceName || "empty"}-${originalIndex.toString()}`
    const isRunning =
      unit.type === "buffer" && runningProductNames.has(unit.productName)
    // The blinking block is the next-to-be-filled inside the active buffer.
    // Quantity Q out of WAREHOUSE_UNIT_CAPACITY means blocks 0..Q-1 are
    // filled and block Q is in flight. Omit when the unit isn't a running
    // buffer (no block to pulse).
    const blinkAt =
      isRunning && quantity < WAREHOUSE_UNIT_CAPACITY ? quantity : undefined
    const resourceTotal =
      unit.type === "empty"
        ? 0
        : getResourceQuantity(warehouse, unit.resource)
    return (
      <div
        className="inline-block mr-1"
        key={key}
        onMouseEnter={handleMouseEnter(describeUnit(unit, resourceTotal))}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className={`w-4 gap-0.5 grid grid-cols-2 p-0.5 border rounded-xs ${variantClasses(unit, isRunning)}`}
        >
          <WarehouseStorageUnit
            points={quantity}
            resource={resourceName}
            index={originalIndex}
            blinkAt={blinkAt}
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
          `Cap. ${renderQty(warehouse.units.length * WAREHOUSE_UNIT_CAPACITY)}`
        )
      }
    >
      <div className="text-sm leading-relaxed">{nodes}</div>
    </ConsoleSection>
  )
}
