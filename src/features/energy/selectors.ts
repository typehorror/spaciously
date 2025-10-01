import { type RootState } from "@/app/store"
import { createDraftSafeSelector } from "@reduxjs/toolkit"
import { parseCellId } from "../cell/utils"
import { selectAllActiveTasks } from "../task/taskSlice"
import { selectAllBuildings } from "../building/buildingSlice"

export const selectEnergyInfo = createDraftSafeSelector(
  [
    (state: RootState) => selectAllActiveTasks(state),
    (state: RootState) => selectAllBuildings(state),
    (_, planetId: number) => planetId,
  ],
  (activeTasks, buildings, planetId) => {
    let produced = 0
    let consumed = 0

    for (const task of activeTasks) {
      // if (parseCellId(task.cellId).planetId === planetId) {
      //   consumed += task.recipe.energy
      // }
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
