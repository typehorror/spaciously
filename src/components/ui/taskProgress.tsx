/**
 * TaskProgress
 *
 * Two visual renderers for an in-progress task — a horizontal bar
 * (TaskBarProgress) and a circular SVG ring (TaskCircleProgress).
 *
 * Both compute progress from the task's wall-clock `startedAt` and `duration`.
 *
 * Animation strategy: snap to the current % with no transition, then on the
 * next tick set the target to 100% with `transitionDuration = remainingTime`.
 * The CSS engine animates the rest linearly. Re-runs whenever startedAt,
 * duration, or task state changes.
 */
import { TaskState } from "@/features/task/types"
import { useEffect, useState } from "react"

interface TaskProgressProps {
  startedAt: number
  duration: number
  state: TaskState
  label?: string
}

function getProgressPercentage(startedAt: number, duration: number): number {
  const elapsed = Date.now() - startedAt
  return Math.min((elapsed / duration) * 100, 100)
}

export const TaskBarProgress: React.FC<TaskProgressProps> = props => {
  const [progress, setProgress] = useState(
    getProgressPercentage(props.startedAt, props.duration),
  )
  const [transitionMs, setTransitionMs] = useState(props.duration)

  useEffect(() => {
    if (props.state !== TaskState.IN_PROGRESS) return
    setTransitionMs(0)
    setProgress(getProgressPercentage(props.startedAt, props.duration))
    const timeout = setTimeout(() => {
      setProgress(100)
      setTransitionMs(
        Math.max(0, props.duration - (Date.now() - props.startedAt)),
      )
    }, 50)
    return () => {
      clearTimeout(timeout)
    }
  }, [props.startedAt, props.duration, props.state])

  return (
    <div className="w-full">
      {props.label && (
        <div className="text-sm my-2 opacity-70">{props.label}</div>
      )}
      <div className="w-full h-2 bg-primary/20 rounded overflow-hidden">
        <div
          className="h-full bg-green-400 transition-all ease-linear"
          style={{
            width: `${progress.toString()}%`,
            transitionDuration: `${transitionMs.toString()}ms`,
          }}
        ></div>
      </div>
    </div>
  )
}

export const TaskCircleProgress: React.FC<TaskProgressProps> = props => {
  const size = 48
  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI

  const [transitionMs, setTransitionMs] = useState(props.duration)
  const [strokeDashoffset, setStrokeDashoffset] = useState(
    circumference -
      (getProgressPercentage(props.startedAt, props.duration) / 100) *
        circumference,
  )

  useEffect(() => {
    if (props.state !== TaskState.IN_PROGRESS) return
    setTransitionMs(0)
    const currentProgress = getProgressPercentage(
      props.startedAt,
      props.duration,
    )
    setStrokeDashoffset(circumference - (currentProgress / 100) * circumference)
    const timeout = setTimeout(() => {
      setStrokeDashoffset(0)
      setTransitionMs(
        Math.max(0, props.duration - (Date.now() - props.startedAt)),
      )
    }, 50)
    return () => {
      clearTimeout(timeout)
    }
  }, [props.startedAt, props.duration, props.state, circumference])

  return (
    <div className="flex flex-col items-center">
      {props.label && (
        <div className="text-sm my-2 opacity-70 text-center">{props.label}</div>
      )}
      <div className="relative">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="opacity-20"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgb(74, 222, 128)"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{
              transition: `stroke-dashoffset ${transitionMs.toString()}ms linear`,
            }}
          />
        </svg>
      </div>
    </div>
  )
}
