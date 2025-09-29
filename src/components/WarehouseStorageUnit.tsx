import { resourceBackgroundColor } from "@/features/resources/resources"
import { type ResourceName } from "@/features/resources/types"
import { range } from "lodash"

interface Props {
  points: number
  resource: string
  index: number
}

export const WarehouseStorageUnit = ({ points, resource, index }: Props) => {
  const colorClass =
    resource in resourceBackgroundColor
      ? resourceBackgroundColor[resource as ResourceName]
      : "bg-gray-600"

  const filledPoints = range(0, points).map(i => (
    <div
      key={`${index.toString()}-point-${i.toString()}-${resource}`}
      className={`${colorClass} w-1 h-1 rounded-[1px]`}
    ></div>
  ))
  const emptyPoints = range(filledPoints.length, 8).map(i => (
    <div
      key={`${index.toString()}-point-${i.toString()}-${resource}`}
      className={`bg-gray-500/40 w-1 h-1 rounded-[1px]`}
    ></div>
  ))
  return (
    <>
      {filledPoints}
      {emptyPoints}
    </>
  )
}
