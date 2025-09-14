import {
  producerAdapter,
  producerSlice,
  selectAllProducers,
} from "./producerSlice"
import { generateProductionKey } from "./utils"
import type { Production } from "./types"
import { ResourceName } from "../resources/types"
import { type RootState } from "@/app/store"

describe("producerSlice selectors reference stability", () => {
  it("returns the same array reference when state is unchanged", () => {
    const initial = producerAdapter.getInitialState()

    // call the exported selector with a root-like state so the memoization
    // created by the slice is applied. This selector expects the slice to
    // live under the `producerState` key in the root state.

    const root = { producer: initial } as unknown as RootState

    const a = selectAllProducers(root)
    const b = selectAllProducers(root)

    // same reference when the same root state object is passed
    expect(a).toBe(b)
  })

  it("returns a new array reference after an update", () => {
    const initial = producerAdapter.getInitialState()

    const rootBefore = { producer: initial } as unknown as RootState

    const before = selectAllProducers(rootBefore)

    // create a production and toggle it on via reducer
    const production: Production = {
      cellId: "0:1:1",
      name: "miner",
      resource: ResourceName.ORE,
      quantity: 1,
      period: 1000,
      energyUsage: 10,
      id: generateProductionKey("0:1:1", "miner"),
      lastProductionTime: Date.now(),
    }

    const next = producerSlice.reducer(
      initial,
      producerSlice.actions.toggleProduction({ production, activate: true }),
    )

    const rootAfter = { producer: next } as unknown as RootState

    const after = selectAllProducers(rootAfter)

    // different reference after a state change
    expect(after).not.toBe(before)

    // and contains the new production
    expect(after).toHaveLength(1)
    expect(after[0].id).toBe(production.id)
  })
})
