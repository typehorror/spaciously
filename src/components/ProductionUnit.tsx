/*
 * ProductionUnit
 *
 * Toggle control for a single (cell, product) production. Reads from
 * productionSlice; halted-ness is derived from buffer state via the
 * selector. Toggling is gated by selectCanStartProduction — the button
 * disables when no empty storage unit is available to claim as the buffer,
 * and the disabled state surfaces a tooltip explaining why.
 *
 * Visual language for the running / halted / disabled states is documented
 * in ADR-0001 (Q12). Halted = amber, running = green, disabled = grey +
 * tooltip.
 */
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { Progress } from "./ui/progress"
import { type Product } from "@/features/production/types"
import { TaskBarProgress } from "./ui/taskProgress"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./ui/tooltip"
import {
  productionStarted,
  productionStopped,
  selectCanStartProduction,
  selectProductionOrderByKey,
  selectRunningProductionOrders,
} from "@/features/production/productionSlice"
import { parseCellId } from "@/features/cell/utils"
import { TaskState } from "@/features/task/types"

interface Props {
  product: Product
  cellId: string
}

export const ProductionUnit = ({ product, cellId }: Props) => {
  const dispatch = useAppDispatch()
  const order = useAppSelector(state =>
    selectProductionOrderByKey(state, cellId, product.name),
  )
  const canStart = useAppSelector(state =>
    selectCanStartProduction(state, cellId, product.name),
  )
  const { planetId } = parseCellId(cellId)
  const isRunning = useAppSelector(state =>
    selectRunningProductionOrders(state, planetId).some(
      o => o.cellId === cellId && o.productName === product.name,
    ),
  )

  const isActive = !!order
  const isHalted = isActive && !isRunning
  const isDisabled = !isActive && !canStart

  const onToggleProduction = () => {
    if (isActive) {
      dispatch(productionStopped({ cellId, productName: product.name }))
    } else if (canStart) {
      // Recipe buildTime is in seconds; the slice tracks duration in ms.
      dispatch(
        productionStarted({
          cellId,
          productName: product.name,
          resource: product.name,
          duration: product.recipe.buildTime * 1000,
          energyUsage: product.recipe.energy,
        }),
      )
    }
  }

  const statusHint = isHalted
    ? "Buffer full"
    : isActive
      ? "Click to Stop"
      : isDisabled
        ? "Storage full"
        : "Click to Start"

  const nameClass = isHalted
    ? "text-amber-400 font-bold"
    : isActive
      ? "text-green-500 font-bold"
      : isDisabled
        ? "text-gray-600"
        : "text-gray-500 group-hover:text-gray-400 font-medium"

  const button = (
    <button
      type="button"
      disabled={isDisabled}
      className="rounded-sm cursor-pointer disabled:cursor-not-allowed bg-gradient-to-br hover:from-slate-800 hover:to-slate-900 group hover:border-gray-800 block w-full p-2 text-left border border-transparent"
      onClick={onToggleProduction}
      aria-label={`Toggle ${product.name} production`}
    >
      <div className="flex-col flex w-full space-y-2">
        <div className="flex flex-row space-x-1 justify-between items-center">
          <div className={`flex-1 items-center ${nameClass}`}>
            {product.name}
          </div>
          <div className="text-xs italic">
            <span className="text-gray-400 opacity-50 transition-opacity group-hover:opacity-100">
              {statusHint}
            </span>
          </div>
        </div>
        <div>
          {order ? (
            <TaskBarProgress
              startedAt={order.startedAt}
              duration={order.duration}
              state={isHalted ? TaskState.PAUSED : TaskState.IN_PROGRESS}
            />
          ) : (
            <Progress value={0} max={1} barClassName="bg-gray-600" />
          )}
        </div>
      </div>
    </button>
  )

  // Disabled <button> elements don't fire mouse events, so the tooltip
  // wraps a span sibling that receives the hover/focus. Only shown in the
  // disabled state — otherwise the button's own statusHint label is
  // sufficient and a second tooltip would be noise.
  if (isDisabled) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="block w-full">{button}</span>
        </TooltipTrigger>
        <TooltipContent side="left" className="font-mono text-xs">
          No empty storage unit available to claim as buffer.
        </TooltipContent>
      </Tooltip>
    )
  }

  return button
}
