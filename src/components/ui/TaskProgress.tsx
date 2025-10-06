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
  const [duration, setDuration] = useState(props.duration)

  useEffect(() => {
    // only animate if the task is in progress
    if (props.state === TaskState.IN_PROGRESS) {
      // onload or when startedAt/duration changes quickly set to current progress
      setDuration(0) // no transition
      setProgress(getProgressPercentage(props.startedAt, props.duration)) // current %
      // then animate to 100%, the transition duration is the remaining time
      const timeout = setTimeout(() => {
        setProgress(100) // current %
        setDuration(props.duration - (Date.now() - props.startedAt))
      }, 50)
      return () => {
        clearTimeout(timeout)
      }
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
            transitionDuration: `${duration.toString()}ms`,
          }}
        ></div>
      </div>
    </div>
  )
}

export const TaskCircleProgress: React.FC<TaskProgressProps> = props => {
  const [duration, setDuration] = useState(props.duration)

  // Calculate circle properties
  const size = 48 // Size of the circle
  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDasharray = circumference

  const [strokeDashoffset, setStrokeDashoffset] = useState(
    circumference -
      (getProgressPercentage(props.startedAt, props.duration) / 100) *
        circumference,
  )

  useEffect(() => {
    // only animate if the task is in progress
    if (props.state === TaskState.IN_PROGRESS) {
      // onload or when startedAt/duration changes quickly set to current progress
      setDuration(0) // no transition
      const currentProgress = getProgressPercentage(
        props.startedAt,
        props.duration,
      )
      setStrokeDashoffset(
        circumference - (currentProgress / 100) * circumference,
      )
      // then animate to 100%, the transition duration is the remaining time
      const timeout = setTimeout(() => {
        setStrokeDashoffset(0) // 100% progress = 0 offset
        setDuration(props.duration - (Date.now() - props.startedAt))
      }, 50)
      return () => {
        clearTimeout(timeout)
      }
    }
  }, [props.startedAt, props.duration, props.state, circumference])
  console.log({ duration, strokeDashoffset })
  return (
    <div className="flex flex-col items-center">
      {props.label && (
        <div className="text-sm my-2 opacity-70 text-center">{props.label}</div>
      )}
      <div className="relative">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="opacity-20"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgb(74, 222, 128)" // green-400
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            style={{
              transition: `stroke-dashoffset ${duration.toString()}ms linear`,
            }}
          />
        </svg>
      </div>
    </div>
  )
}
