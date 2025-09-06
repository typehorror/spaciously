import { type AllResourceNames } from "../resources/types"

export type NewProduction = {
  name: string
  resource: AllResourceNames
  quantity: number
  period: number // the time it takes to produce the resource in ms
  cost?: Partial<Record<AllResourceNames, number>>
}

export type Production = NewProduction & {
  cellId: string
  id: string
}

export type ActiveProduction = {
  id: string
  lastProductionTime: number
}
