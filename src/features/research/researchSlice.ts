import { createAppSlice } from "@/app/createAppSlice"
import { createEntityAdapter, type PayloadAction } from "@reduxjs/toolkit"
import type { Research } from "./types"
import { researchTree } from "./researchTree"

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

  // selectors operate on the slice state
  selectors: {
    getResearch: (state, id: string) =>
      researchAdapter.getSelectors().selectById(state, id),

    getAllResearch: state => researchAdapter.getSelectors().selectAll(state),

    // researches whose prerequisites are all researched and which are not yet researched
    getAvailableResearch: state => {
      const all = researchAdapter.getSelectors().selectAll(state)
      const researchedIds = new Set(
        all.filter(r => r.researched).map(r => r.id),
      )
      return all.filter(
        r =>
          !r.researched && r.prerequisites.every(pid => researchedIds.has(pid)),
      )
    },

    getResearched: state =>
      researchAdapter
        .getSelectors()
        .selectAll(state)
        .filter(r => r.researched),

    getLocked: state =>
      researchAdapter
        .getSelectors()
        .selectAll(state)
        .filter(r => !r.researched),
  },
})

export const {
  getResearch,
  getAllResearch,
  getAvailableResearch,
  getResearched,
  getLocked,
} = researchSlice.selectors

export const { setResearched, unlockResearch, resetResearchTree } =
  researchSlice.actions
