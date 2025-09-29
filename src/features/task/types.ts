import { type ProductRecipe } from "../production/types"

export enum TaskState {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  PAUSED = "PAUSED",
}

export interface TaskBase<TState extends TaskState = TaskState> {
  id: string
  state: TState
  /**
   * Duration of the task in milliseconds
   */
  createdAt: number
  startedAt: TState extends "IN_PROGRESS" ? number : null
  pausedAt: TState extends "PAUSED" ? number : null
  completedAt: TState extends "COMPLETED" ? number : null
  /**
   * indicate if the production is contunuous (e.g. production task)
   * or one-off (e.g. building, terraforming)
   */
  isContinuous: boolean
  recipe: ProductRecipe
}

export interface TerraformTask extends TaskBase {
  taskType: "TERRAFORM"
  cellId: string
}

export interface BuildingTask extends TaskBase {
  taskType: "BUILDING"
  cellId: string
  slotIndex: number
  buildingType: string
}

export interface ProductionTask extends TaskBase {
  taskType: "PRODUCTION"
  cellId: string
  buildingIds: string[]
  resource: string // resource being produced
}

export type Task = TerraformTask | BuildingTask | ProductionTask
