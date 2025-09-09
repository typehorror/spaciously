import { useEffect, useRef } from "react"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { getProducers, produceResource } from "../production/producerSlice"
import { getProductionIndex } from "../production/productionSlice"
import { type Production } from "../production/types"

const TICK_RATE = 100 // 100ms per tick (10 ticks/sec)

export const GameLoop = () => {
  const dispatch = useAppDispatch()
  const lastTick = useRef(new Date().getTime())
  const producers = useAppSelector(getProducers)
  const productionIndex = useAppSelector(getProductionIndex)

  const computeProduction = (producers: Production[]) => {
    const results = []
    const now = Date.now()
    for (const production of producers) {
      let amount = 0

      const progress = now - production.lastProductionTime
      amount = Math.floor(progress / production.period) * production.quantity
      if (amount > 0) {
        const lastProductionTime = now - (progress % production.period)

        results.push({
          id: production.id,
          amount,
          resource: production.resource,
          lastProductionTime,
          progress: (progress % production.period) / production.period,
        })
      }
    }

    return results
  }

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      if (now - lastTick.current >= TICK_RATE) {
        lastTick.current = now
        const production = computeProduction(producers)
        if (production.length > 1) {
          console.log("produced", production.length, "items")
        }
        for (const p of production) {
          // console.log(`producing ${p.amount.toString()} of ${p.resource}`)
          dispatch(
            produceResource({
              producerId: p.id,
              lastProductionTime: p.lastProductionTime,
              amount: p.amount,
              resource: p.resource,
            }),
          )
        }
      }
    }, TICK_RATE / 2) // check twice per tick

    return () => {
      clearInterval(interval)
    }
  }, [dispatch, producers, productionIndex])

  return null
}
