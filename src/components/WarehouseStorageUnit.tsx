/*
 * WarehouseStorageUnit
 *
 * Renders the 2x4 grid of "blocks" inside a single storage unit. Filled
 * blocks take the resource's color; empty blocks are a muted grey. When
 * `blinkAt` is provided (and within the empty range), that single block
 * pulses — representing the block currently being produced into by the
 * owning production. Only the next-to-be-filled block blinks; previously
 * filled blocks stay solid, later empty blocks stay muted.
 */
import { resourceBackgroundColor } from "@/features/resources/resources"
import { type ResourceName } from "@/features/resources/types"
import { range } from "lodash"

interface Props {
  points: number
  resource: string
  index: number
  /**
   * Index of the block (0..7) currently being produced into. Pulses while
   * the cycle is in flight. Omit when the unit is not a running buffer.
   */
  blinkAt?: number
}

export const WarehouseStorageUnit = ({
  points,
  resource,
  index,
  blinkAt,
}: Props) => {
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
  const emptyPoints = range(filledPoints.length, 8).map(i => {
    const isBlinking = i === blinkAt
    const className = isBlinking
      ? `${colorClass} w-1 h-1 rounded-[1px] animate-pulse`
      : `bg-gray-500/40 w-1 h-1 rounded-[1px]`
    return (
      <div
        key={`${index.toString()}-point-${i.toString()}-${resource}`}
        className={className}
      ></div>
    )
  })
  return (
    <>
      {filledPoints}
      {emptyPoints}
    </>
  )
}
