import { type RootState } from "@/app/store"
import { createDraftSafeSelector } from "@reduxjs/toolkit"
import { parseCellId } from "../cell/utils"
import { selectAllActiveTasks } from "../task/taskSlice"

export const selectEnergyInfo = createDraftSafeSelector(
  [
    (state: RootState) => selectAllActiveTasks(state),
    (_, planetId: number) => planetId,
  ],
  (producers, planetId) => {
    let produced = 0
    let consumed = 0

    for (const p of producers) {
      if (parseCellId(p.cellId).planetId === planetId) {
        consumed += p.recipe.energy
      }
    }

    // for (const b of buildings) {
    //   if (parseCellId(b.cellId).planetId === planetId) {
    //     produced += b.energy.production
    //     consumed += b.energy.consumption
    //   }
    // }

    return { produced, consumed, net: produced - consumed }
  },
)
