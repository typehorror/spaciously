import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { Progress } from "./ui/progress"
import {
  addProductionTask,
  removeTask,
  selectProductionTask,
} from "@/features/task/taskSlice"
import { type Product } from "@/features/production/types"
import TaskProgress from "./ui/TaskProgress"

interface Props {
  product: Product
  cellId: string
  buildingIds: string[]
}

export const ProductionUnit = ({ product, cellId, buildingIds }: Props) => {
  const dispatch = useAppDispatch()

  const productionTask = useAppSelector(state =>
    selectProductionTask(state, cellId, product.name),
  )

  const isActive = !!productionTask

  const onToggleProduction = () => {
    if (productionTask) {
      dispatch(removeTask({ id: productionTask.id }))
    } else {
      dispatch(
        addProductionTask({
          cellId,
          resource: product.name,
          buildingIds,
          recipe: product.recipe,
        }),
      )
    }
  }

  return (
    <button
      type="button"
      className="rounded-sm cursor-pointer bg-gradient-to-br hover:from-slate-800 hover:to-slate-900 group hover:border-gray-800 block w-full p-2  text-left border border-transparent"
      onClick={onToggleProduction}
      aria-label={`Turn on ${product.name} production`}
    >
      <div className="flex-col flex w-full space-y-2">
        <div className="flex flex-row space-x-1 justify-between items-center">
          <div
            className={`flex-1 items-center ${isActive ? "text-green-500 font-bold" : "text-gray-500 group-hover:text-gray-400 font-medium"}`}
          >
            {product.name}
          </div>
          <div className="text-xs italic">
            {isActive ? (
              <span className="text-gray-400 opacity-0 transition-opacity group-hover:opacity-100">
                Click to Stop
              </span>
            ) : (
              <>
                <span className="text-gray-600 group-hover:hidden">Off</span>
                <span className="text-gray-400 group-hover:inline hidden">
                  Click to Start
                </span>
              </>
            )}
          </div>
        </div>
        <div>
          {isActive && productionTask.startedAt ? (
            <div>
              <TaskProgress
                startedAt={productionTask.startedAt}
                duration={productionTask.recipe.buildTime * 1000}
                state={productionTask.state}
              />
            </div>
          ) : (
            <Progress
              value={0}
              max={1}
              duration={0}
              barClassName="bg-gray-600"
            />
          )}
        </div>
      </div>
    </button>
  )
}
