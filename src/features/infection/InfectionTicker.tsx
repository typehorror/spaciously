/*
 * InfectionTicker
 *
 * The runtime that drives the one-shot infection event. Mirrors the
 * BloomTicker pattern: a useEffect-bound interval that pulls live state
 * via store.getState() (not React selectors, so the interval is not
 * restarted on every Redux update), evaluates the pure decision
 * function, and dispatches the resulting effect.
 *
 * On fire:
 *   1. infestationSeeded — Bloom appears on the host cell at the
 *      configured starting amount.
 *   2. infectionFired — the slice records the one-shot.
 *   3. A sonner banner appears with a "Focus camera" action that
 *      switches the player to the host cell's planet and centers the
 *      hex grid on the cell.
 *
 * The starting planet (id 1) is the only valid target — the brief and
 * ADR-0002 §9 are explicit that this is a starting-planet event. Other
 * planets get their Bloom from dormant seeding (slice #10).
 *
 * Public API: <InfectionTicker />
 */
import { useEffect } from "react"
import { toast } from "sonner"
import { useAppDispatch, useAppStore } from "@/app/hooks"
import { evaluateInfectionTick } from "./infection"
import { infectionFired, selectHasFired } from "./infectionSlice"
import { infestationSeeded } from "@/features/bloom/bloomSlice"
import { resolveCellCap } from "@/features/bloom/simulator"
import {
  selectGameStartTime,
  selectGameStatus,
} from "@/features/game/gameSlice"
import { selectCellsByPlanetId } from "@/features/cell/cellSlice"
import { selectBuildingsByPlanetId } from "@/features/building/buildingSlice"
import { setCurrentPlanetId, setFocusedCell } from "@/features/planet/planetSlice"
import { parseCellId } from "@/features/cell/utils"
import { HexCellState, ResourceName } from "@/features/cell/types"

// The starting planet — the infection event is scripted to fire only here.
// See ADR-0002 §9 and CONTEXT.md "Infection".
const STARTING_PLANET_ID = 1

// Tick the trigger check once per second. Faster than the bloom tick
// (5s) so the event fires close to the moment the floors are met,
// without burning frames on a check that almost always returns null.
const INFECTION_CHECK_INTERVAL_MS = 1_000

export const InfectionTicker = () => {
  const dispatch = useAppDispatch()
  const store = useAppStore()

  useEffect(() => {
    const interval = setInterval(() => {
      const state = store.getState()
      if (selectGameStatus(state) !== "playing") return
      if (selectHasFired(state)) return

      const startTime = selectGameStartTime(state)
      if (startTime === 0) return
      const elapsedMs = Date.now() - startTime

      const developedCells = selectCellsByPlanetId(
        state,
        STARTING_PLANET_ID,
      ).filter(c => c.state === HexCellState.DEVELOPED)

      const buildings = selectBuildingsByPlanetId(state, STARTING_PLANET_ID)

      const candidates = buildings.flatMap(building => {
        const cell = developedCells.find(c => c.id === building.cellId)
        if (!cell) return []
        return [
          {
            id: building.id,
            cellId: building.cellId,
            biomassOnCell: cell.resources[ResourceName.BIOMASS],
            cellCap: resolveCellCap(cell.resources),
          },
        ]
      })

      const decision = evaluateInfectionTick(
        {
          elapsedMs,
          hasFired: false,
          developedCellCount: developedCells.length,
          candidates,
        },
        Math.random,
      )
      if (!decision) return

      dispatch(
        infestationSeeded({
          cellId: decision.cellId,
          amount: decision.infestation,
        }),
      )
      dispatch(
        infectionFired({
          cellId: decision.cellId,
          buildingId: decision.buildingId,
        }),
      )

      const { planetId, q, r } = parseCellId(decision.cellId)
      toast.error("Bloom contact: an outbreak has been detected on this colony.", {
        duration: Infinity,
        action: {
          label: "Focus camera",
          onClick: () => {
            dispatch(setCurrentPlanetId(planetId))
            dispatch(setFocusedCell({ q, r }))
          },
        },
      })
    }, INFECTION_CHECK_INTERVAL_MS)

    return () => {
      clearInterval(interval)
    }
  }, [dispatch, store])

  return null
}
