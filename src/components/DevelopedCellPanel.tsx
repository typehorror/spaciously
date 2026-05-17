/**
 * DevelopedCellPanel
 *
 * Inspector for a claimed/developed hex cell. Shows the cell's habitation,
 * its warehouse contents, any active productions, and a grid of building
 * slots. Wrapped in the ship-console aesthetic by CellInformation; this file
 * only owns the inner layout.
 */
import { type Cell } from "@/features/cell/types"
import { WarehouseUnit } from "./WarehouseStorage"
import { useAppSelector } from "@/app/hooks"
import { selectBuildingByCellId } from "@/features/building/buildingSlice"
import { flatMap, range, uniqBy } from "lodash"
import { ProductionUnit } from "./ProductionUnit"
import { NewBuildingButton } from "./NewBuildingButton"
import { CreatedBuildingButton } from "./CreatedBuildingButton"
import { CellHeader, ConsoleSection } from "./CellInspectorChrome"
import { BuildingIcon, FactoryIcon, UsersRoundIcon } from "lucide-react"

interface Props {
  cell: Cell
}

const renderQty = (qty?: number) => (qty ?? 0).toLocaleString()

export const DevelopedCellPanel = ({ cell }: Props) => {
  const { warehouse, habitat } = cell
  const buildings = useAppSelector(state =>
    selectBuildingByCellId(state, cell.id),
  )

  const production = uniqBy(
    flatMap(buildings, b => b.production),
    "name",
  )

  const filledSlots = buildings.length
  const totalSlots = cell.slots

  return (
    <div className="flex flex-col h-full p-5 gap-5">
      <CellHeader
        label="Developed Cell"
        coord={{ q: cell.q, r: cell.r }}
        accent="emerald"
      />

      <ConsoleSection
        title="Habitation"
        icon={UsersRoundIcon}
        meta={`${renderQty(habitat.population)} / ${renderQty(habitat.capacity)}`}
      >
        <div className="text-sm text-white/70">
          Population: {renderQty(habitat.population)} /{" "}
          {renderQty(habitat.capacity)}
        </div>
      </ConsoleSection>

      <WarehouseUnit warehouse={warehouse} />

      <ConsoleSection
        title="Production"
        icon={FactoryIcon}
        meta={
          production.length === 0
            ? "—"
            : `${production.length.toString()} line${production.length === 1 ? "" : "s"}`
        }
      >
        {production.length === 0 ? (
          <div className="text-xs text-white/40 italic">
            No production. Construct a building to begin output.
          </div>
        ) : (
          <div className="space-y-1.5">
            {production.map(prod => (
              <ProductionUnit key={prod.name} product={prod} cellId={cell.id} />
            ))}
          </div>
        )}
      </ConsoleSection>

      <ConsoleSection
        title="Buildings"
        icon={BuildingIcon}
        meta={`${filledSlots.toString()} / ${totalSlots.toString()}`}
      >
        <div className="grid grid-cols-2 gap-3">
          {range(0, cell.slots).map(slotIndex => {
            const building = buildings.find(b => b.slotIndex === slotIndex)
            return (
              <div key={slotIndex}>
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
      </ConsoleSection>
    </div>
  )
}

export default DevelopedCellPanel
