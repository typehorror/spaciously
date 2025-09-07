import { type RootState } from "@/app/store"
import { producerAdapter } from "../production/producerSlice"
import { createDraftSafeSelector } from "@reduxjs/toolkit"
import { parseCellId } from "../cell/utils"
import { buildingAdapter } from "../building/buildingSlice"

export const getEnergyInfo = createDraftSafeSelector(
  [
    (state: RootState) =>
      producerAdapter.getSelectors().selectAll(state.producerState),
    (state: RootState) =>
      buildingAdapter.getSelectors().selectAll(state.building),
    (_, planetId: number) => planetId,
  ],
  (producers, buildings, planetId) => {
    let produced = 0
    let consumed = 0

    for (const p of producers) {
      if (parseCellId(p.cellId).planetId === planetId) {
        consumed += p.energyUsage
      }
    }

    for (const b of buildings) {
      if (parseCellId(b.cellId).planetId === planetId) {
        produced += b.energy.production
        consumed += b.energy.consumption
      }
    }

    return { produced, consumed, net: produced - consumed }
  },
)
