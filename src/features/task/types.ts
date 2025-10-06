import { type Action } from "@reduxjs/toolkit"
// import { type ProductRecipe } from "../production/types"

export enum TaskState {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  PAUSED = "PAUSED",
}

export interface Task {
  id: string
  description: string
  state: TaskState
  /**
   * Duration of the task in milliseconds
   */
  createdAt: number
  startedAt: number | null
  pausedAt: number | null
  completedAt: number | null
  duration: number // in milliseconds
  energyUsage: number // energy usage per second
  isContinuous: boolean
  action: Action
}
