/*
 * ProductionTicker
 *
 * State-rendering ticker for production orders. Mirrors TaskManager's loop
 * but drives the production slice: each interval, look at the set of
 * running orders (the selector already filters out halted ones) and
 * dispatch `cycleDeposited` for any whose cycle duration has elapsed.
 *
 * Halted orders never appear in `selectAllRunningProductionOrders`, so this
 * ticker naturally pauses them — there is no special-case "halt" path here.
 * When their buffer drains and the selector re-includes them, the next
 * tick completes the overdue cycle.
 *
 * Public API: <ProductionTicker />
 */
import { useEffect, useRef } from "react"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import {
  cycleDeposited,
  selectAllRunningProductionOrders,
} from "./productionSlice"

const TICK_RATE = 100
const CYCLE_OUTPUT_QUANTITY = 1

export const ProductionTicker = () => {
  const dispatch = useAppDispatch()
  const lastTick = useRef(Date.now())
  const running = useAppSelector(selectAllRunningProductionOrders)

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      if (now - lastTick.current < TICK_RATE) return
      lastTick.current = now
      for (const order of running) {
        if (now - order.startedAt < order.duration) continue
        dispatch(
          cycleDeposited({
            cellId: order.cellId,
            productName: order.productName,
            quantity: CYCLE_OUTPUT_QUANTITY,
          }),
        )
      }
    }, TICK_RATE / 2)
    return () => {
      clearInterval(interval)
    }
  }, [dispatch, running])

  return null
}
