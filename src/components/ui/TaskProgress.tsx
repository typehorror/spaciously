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

const TaskProgress: React.FC<TaskProgressProps> = props => {
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

export default TaskProgress
