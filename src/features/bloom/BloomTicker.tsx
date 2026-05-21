/*
 * BloomTicker
 *
 * State-rendering ticker for the Bloom simulator. Mirrors ProductionTicker
 * and TaskManager: every BLOOM_TICK_INTERVAL_MS, walks each active planet,
 * gathers its cells, calls the pure simulator, and dispatches the resulting
 * updates as a single bloomTickApplied action.
 *
 * Dormant planets are not in `activePlanets` and are skipped — see
 * ADR-0002 §8 (Dormancy). The starting planet is active by default; other
 * planets activate when a Colony Ship lands (slice #10).
 *
 * Reads state via useAppStore().getState() inside the interval callback to
 * avoid restarting the timer on every Redux update — the ticker is a
 * heartbeat, not a render-reactive component.
 *
 * Public API: <BloomTicker />
 */
import { useEffect } from "react"
import { useAppDispatch, useAppStore } from "@/app/hooks"
import { bloomTickApplied } from "./bloomSlice"
import { simulateTick, type BloomCellInput } from "./simulator"
import { getNeighborCoords } from "../map/utils"
import { getCellId, parseCellId } from "../cell/utils"
import { BLOOM_TICK_INTERVAL_MS } from "@/config"
import { selectGameStatus } from "../game/gameSlice"

export const BloomTicker = () => {
  const dispatch = useAppDispatch()
  const store = useAppStore()

  useEffect(() => {
    const interval = setInterval(() => {
      const state = store.getState()
      if (selectGameStatus(state) !== "playing") return

      const activePlanetIds = Object.entries(state.bloom.activePlanets)
        .filter(([, isActive]) => isActive)
        .map(([planetId]) => Number(planetId))
      if (activePlanetIds.length === 0) return

      const allCells = Object.values(state.cell.entities)
      const allUpdates: Record<string, number> = {}

      for (const planetId of activePlanetIds) {
        const planetCells = allCells.filter(c => c.planetId === planetId)
        if (planetCells.length === 0) continue

        const inputs: BloomCellInput[] = planetCells.map(cell => ({
          id: cell.id,
          resources: cell.resources,
          state: cell.state,
          infestation: state.bloom.infestation[cell.id] ?? 0,
        }))

        const getNeighbors = (cellId: string): string[] => {
          const { q, r } = parseCellId(cellId)
          return getNeighborCoords({ q, r }, planetCells).map(coord =>
            getCellId(coord, planetId),
          )
        }

        const updates = simulateTick({ cells: inputs, getNeighbors })
        for (const [cellId, value] of updates) {
          allUpdates[cellId] = value
        }
      }

      if (Object.keys(allUpdates).length > 0) {
        dispatch(bloomTickApplied({ updates: allUpdates }))
      }
    }, BLOOM_TICK_INTERVAL_MS)

    return () => {
      clearInterval(interval)
    }
  }, [dispatch, store])

  return null
}
