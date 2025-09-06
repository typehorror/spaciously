import { useEffect, useRef } from "react"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { getProducers, updateProduction } from "../production/producerSlice"
import {
  type ProductionIndex,
  getProductionIndex,
} from "../production/productionSlice"
import { type ActiveProduction } from "../production/types"

const TICK_RATE = 100 // 100ms per tick (10 ticks/sec)

export const GameLoop = () => {
  const dispatch = useAppDispatch()
  const lastTick = useRef(new Date().getTime())
  const producers = useAppSelector(getProducers)
  const productionIndex = useAppSelector(getProductionIndex)

  const computeProduction = (
    producers: ActiveProduction[],
    productionIndex: ProductionIndex,
  ) => {
    const results = []
    const now = Date.now()
    for (const producer of producers) {
      let amount = 0
      const production = productionIndex[producer.id]
      if (!production) {
        console.warn(`No production found for producer ${producer.id}`)
        continue
      }

      const progress = now - producer.lastProductionTime
      amount = Math.floor(progress / production.period) * production.quantity
      if (amount > 0) {
        const lastProductionTime = now - (progress % production.period)

        results.push({
          id: producer.id,
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
        const production = computeProduction(producers, productionIndex)
        if (production.length > 1) {
          console.log("produced", production.length, "items")
        }
        for (const p of production) {
          // console.log(`producing ${p.amount.toString()} of ${p.resource}`)
          dispatch(
            updateProduction({
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
