import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { completeTask, selectAllInProgressTasks } from "./taskSlice"
import { useEffect, useRef } from "react"
import { type Task } from "./types"

const TICK_RATE = 100 // 100ms per tick (10 ticks/sec)

export const TaskManager = () => {
  const dispatch = useAppDispatch()
  const lastTick = useRef(new Date().getTime())

  const activeTasks = useAppSelector(selectAllInProgressTasks)

  // Get all completed tasks
  const getCompletedTasks = (tasks: Task[]): Task[] => {
    const results = []
    const now = Date.now()

    for (const task of tasks) {
      if (task.startedAt && now - task.startedAt >= task.duration * 1000) {
        results.push(task)
      }
    }

    return results
  }

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      if (now - lastTick.current >= TICK_RATE) {
        lastTick.current = now
        const completedTasks = getCompletedTasks(activeTasks)

        if (completedTasks.length == 0) return

        for (const task of completedTasks) {
          dispatch(completeTask(task))
          dispatch(task.action)
        }
      }
    }, TICK_RATE / 2) // check twice per tick

    return () => {
      clearInterval(interval)
    }
  }, [dispatch, activeTasks])

  return null
}
