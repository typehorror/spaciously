import { useAppSelector } from "@/app/hooks"
import {
  selectCurrentPlanetId,
  selectFocusedCellCoord,
} from "@/features/planet/planetSlice"
import { selectCellByCoords } from "@/features/cell/cellSlice"

import UnoccupiedCellInformation from "./UnoccupiedCellInformation"
import BuildingInformation from "./BuildingInformation"

export const CellInformation = () => {
  const currentPlanetId = useAppSelector(selectCurrentPlanetId)
  const focusedCellCoord = useAppSelector(selectFocusedCellCoord)
  const focusedCell = useAppSelector(state =>
    selectCellByCoords(state, focusedCellCoord, currentPlanetId),
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
