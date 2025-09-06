import { useAppDispatch, useAppSelector } from "@/app/hooks"
import {
  getProducer,
  toggleProduction,
} from "@/features/production/producerSlice"
import { type Production } from "@/features/production/types"
import { PlayCircleIcon, StopCircleIcon } from "@heroicons/react/24/solid"
import { Progress } from "./ui/progress"
import CurrentProgress from "./ui/currentProgress"

type Props = {
  production: Production
}

export const ProductionUnit = ({ production }: Props) => {
  const dispatch = useAppDispatch()

  const producer = useAppSelector(state => getProducer(state, production))
  const isActive = !!producer

  const onToggleProduction = () => {
    dispatch(toggleProduction(production))
  }

  // When the value stays the same between rendering (like 1.01% twice)
  // the component won't refresh. This forces the value to have a higher
  // precision (admittedly random) but under a millisecond.
  const now = Date.now() + Math.random()
  const value = now - (producer ? producer.lastProductionTime : 0) // progress in ms
  const progress = (100 * value) / production.period // progress in %

  return (
    <button
      type="button"
      className="rounded-sm cursor-pointer bg-gradient-to-br hover:from-slate-800 hover:to-slate-900 group hover:border-gray-800 block w-full p-2  text-left border border-transparent"
      onClick={onToggleProduction}
      aria-label={`Turn on ${production.name} production`}
    >
      <div className="flex-col flex w-full space-y-2">
        <div className="flex flex-row space-x-1 justify-between items-end">
          <div
            className={`flex-1 items-center ${isActive ? "text-green-500 font-bold" : "text-gray-500 group-hover:text-gray-400 font-medium"}`}
          >
            {production.name}
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
          {isActive ? (
            <div>
              <CurrentProgress
                progress={progress}
                duration={production.period - value}
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

  return (
    <div className="flex justify-between items-center text-sm border-b border-gray-500/30 py-2">
      <div className="flex-col flex w-full space-y-2">
        <div className="flex flex-row space-x-1">
          <button
            type="button"
            className="shrink-0"
            onClick={onToggleProduction}
            aria-label={isActive ? "Turn off" : "Turn on"}
          >
            {isActive ? (
              <PlayCircleIcon className="w-5 h-5 text-green-600" />
            ) : (
              <StopCircleIcon className="w-5 h-5 text-gray-400" />
            )}
          </button>
          <div
            className={`flex-1 items-center ${isActive ? "text-green-500 font-bold" : "text-gray-500 font-medium"}`}
          >
            {production.name}
          </div>
        </div>

        <div>
          <CurrentProgress
            progress={progress}
            duration={production.period - value}
          />
        </div>
      </div>
    </div>
  )
}
