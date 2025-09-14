import { createAppSlice } from "@/app/createAppSlice"
import {
  createDraftSafeSelector,
  createEntityAdapter,
  type PayloadAction,
} from "@reduxjs/toolkit"
import type { Research } from "./types"
import { researchTree } from "./researchTree"
import { type RootState } from "@/app/store"

export const researchAdapter = createEntityAdapter<Research>({
  // default selectId uses the `id` field so we don't need to provide it here
  sortComparer: (a: Research, b: Research) => a.name.localeCompare(b.name),
})

// seed initial state from the static research tree
const seededInitialState = researchAdapter.setAll(
  researchAdapter.getInitialState(),
  researchTree,
)

export const researchSlice = createAppSlice({
  name: "research",
  initialState: seededInitialState,
  reducers: {
    // mark a single research as researched/unresearched
    setResearched: (
      state,
      action: PayloadAction<{ id: string; researched: boolean }>,
    ) => {
      const { id, researched } = action.payload
      researchAdapter.updateOne(state, { id, changes: { researched } })
    },

    // convenience action to mark a research completed
    unlockResearch: (state, action: PayloadAction<string>) => {
      researchAdapter.updateOne(state, {
        id: action.payload,
        changes: { researched: true },
      })
    },

    // reset the whole tree to defaults (useful for new game)
    resetResearchTree: state => {
      researchAdapter.setAll(state, researchTree)
    },
  },
})

export const { setResearched, unlockResearch, resetResearchTree } =
  researchSlice.actions

const researchSelectors = researchAdapter.getSelectors<RootState>(
  s => s.research,
)

export const {
  selectAll: selectAllResearches,
  selectById: selectResearchById,
} = researchSelectors

export const selectLocked = createDraftSafeSelector(
  [(state: RootState) => researchSelectors.selectAll(state)],
  (research): Research[] => research.filter(r => !r.researched),
)

export const selectResearched = createDraftSafeSelector(
  [(state: RootState) => researchSelectors.selectAll(state)],
  (research): Research[] => research.filter(r => r.researched),
)

export const selectAvailableResearches = createDraftSafeSelector(
  [
    (state: RootState) => researchSelectors.selectAll(state),
    (state: RootState) => selectResearched(state),
  ],
  (all, researched): Research[] => {
    const researchedIds = new Set(researched.map(r => r.id))
    return all.filter(
      r =>
        !r.researched && r.prerequisites.every(pid => researchedIds.has(pid)),
    )
  },
)
