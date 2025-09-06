import { useEffect, useState } from "react"

type CurrentProgressProps = {
  progress: number // Starting point (0 to 1.0)
  duration: number // Duration in milliseconds
}

const CurrentProgress: React.FC<CurrentProgressProps> = props => {
  const [progress, setProgress] = useState(props.progress)
  const [duration, setDuration] = useState(props.duration)

  useEffect(() => {
    setProgress(props.progress) // current %
    setDuration(50)
    const timeout = setTimeout(() => {
      setProgress(100) // current %
      setDuration(props.duration)
    }, 50)
    return () => {
      clearTimeout(timeout)
    }
  }, [props.progress, props.duration])

  return (
    <div className="w-full h-2 bg-primary/20 rounded overflow-hidden">
      <div
        className="h-full bg-green-400 transition-all ease-linear"
        style={{
          width: `${progress.toString()}%`,
          transitionDuration: `${duration.toString()}ms`,
        }}
      ></div>
    </div>
  )
}

export default CurrentProgress
