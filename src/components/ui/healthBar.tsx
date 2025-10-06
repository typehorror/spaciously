import { cn } from "@/lib/utils"
import "./healthBar.css"
import { range } from "lodash"

interface Props {
  className?: string
  barClassName?: string
  value: number
  maxValue: number
}

export function HealthBar({ className, value, maxValue, ...props }: Props) {
  value = Math.min(value, maxValue)
  const percentage = (value / maxValue) * 100

  const barClassName = cn({
    "bg-red-800/50 border-red-500": percentage < 20,
    "bg-orange-800/50 border-orange-500": percentage < 40 && percentage >= 20,
    "bg-yellow-800/50 border-yellow-500": percentage < 60 && percentage >= 40,
    "bg-blue-800/50 border-blue-500": percentage < 80 && percentage >= 60,
    "bg-green-800/50 border-green-500": percentage >= 80,
  })

  const healthBars = range(0, 10).map(i => {
    const barThreshold = i * 10
    return (
      <div
        key={i}
        className={cn(
          "h-3 flex-1 border rounded-xs",
          percentage >= barThreshold ? barClassName : "bg-gray-900",
          props.barClassName,
        )}
      ></div>
    )
  })

  return (
    <div className={cn("flex justify-between mb-1 gap-x-0.5", className)}>
      {healthBars.map(bar => bar)}
    </div>
  )
}
