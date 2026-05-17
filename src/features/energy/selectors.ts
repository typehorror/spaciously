import { type RootState } from "@/app/store"
import { createDraftSafeSelector } from "@reduxjs/toolkit"
import { parseCellId } from "../cell/utils"
import { selectAllActiveTasks } from "../task/taskSlice"
import { selectAllBuildings } from "../building/buildingSlice"
import { selectProductionEnergyDraw } from "../production/productionSlice"

export const selectEnergyInfo = createDraftSafeSelector(
  [
    (state: RootState) => selectAllActiveTasks(state),
    (state: RootState) => selectAllBuildings(state),
    (state: RootState, planetId: number) =>
      selectProductionEnergyDraw(state, planetId),
    (_, planetId: number) => planetId,
  ],
  (activeTasks, buildings, productionDraw, planetId) => {
    let produced = 0
    // Production energy comes from selectProductionEnergyDraw — halted
    // productions are already excluded, so the planet's production load is
    // exactly the sum of running orders. Other task types (terraform,
    // research, construction) still flow through the generic task system.
    let consumed = productionDraw

    for (const task of activeTasks) {
      consumed += task.energyUsage
    }

    for (const b of buildings) {
      if (parseCellId(b.cellId).planetId === planetId) {
        if (b.energyUsage > 0) {
          consumed += b.energyUsage
        } else {
          produced -= b.energyUsage
        }
      }
    }

    return { produced, consumed, net: produced - consumed }
  },
)
