import { useAppSelector } from "@/app/hooks"
import {
  getCurrentPlanetId,
  getFocusedCellCoord,
} from "@/features/planet/planetSlice"
import { getCellByCoord } from "@/features/cell/cellSlice"

import UnoccupiedCellInformation from "./UnoccupiedCellInformation"
import BuildingInformation from "./BuildingInformation"

export const CellInformation = () => {
  const currentPlanetId = useAppSelector(getCurrentPlanetId)
  const focusedCellCoord = useAppSelector(getFocusedCellCoord)
  const focusedCell = useAppSelector(state =>
    getCellByCoord(state, currentPlanetId, focusedCellCoord),
  )

  if (!focusedCell) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <p>No cell selected</p>
      </div>
    )
  }

  // return <UnoccupiedCellInformation cell={focusedCell} />

  if (focusedCell.state === "claimed") {
    return <BuildingInformation cell={focusedCell} />
  } else {
    return <UnoccupiedCellInformation cell={focusedCell} />
  }
}
