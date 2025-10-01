import { createDraftSafeSelector } from "@reduxjs/toolkit"
import { selectResearched } from "../research/researchSlice"
import { allBuildings } from "./buildings/buildings"
import { type RootState } from "@/app/store"

export const selectAllBuildings = createDraftSafeSelector(
  [(state: RootState) => selectResearched(state)],
  researched => {
    const researchedNames = researched.map(r => r.name)
    return allBuildings.filter(b =>
      b.requiredResearch.every(req => researchedNames.includes(req)),
    )
  },
)
