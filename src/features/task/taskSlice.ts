import { createAppSlice } from "@/app/createAppSlice"
import {
  createDraftSafeSelector,
  createEntityAdapter,
  type PayloadAction,
} from "@reduxjs/toolkit"
import { gameSlice } from "../game/gameSlice"
import { type RootState } from "@/app/store"
import {
  type Task,
  TaskState,
  type TerraformTask,
  type ProductionTask,
  type BuildingTask,
  type TaskBase,
} from "./types"
import { type ProductRecipe } from "../production/types"

const taskAdapter = createEntityAdapter<Task>({
  sortComparer: (a, b) => a.createdAt - b.createdAt,
})

export const TaskSlice = createAppSlice({
  name: "task",
  initialState: taskAdapter.getInitialState(),
  reducers: {
    addTerraformTask: (
      state,
      action: PayloadAction<{ cellId: string; state: TaskState }>,
    ) => {
      const id = `${action.payload.cellId}:TERRAFORM`
      // Prevent adding duplicate terraform tasks for the same cell
      if (taskAdapter.getSelectors().selectById(state, id)) {
        return
      }
      const newTerraformTask: TerraformTask = {
        id,
        taskType: "TERRAFORM",
        createdAt: Date.now(),
        startedAt:
          action.payload.state === TaskState.IN_PROGRESS ? Date.now() : null,
        completedAt: null,
        pausedAt: null,
        isContinuous: false,
        recipe: {
          inputs: [
            { product: "Ore", quantity: 100 },
            { product: "Gas", quantity: 50 },
            { product: "Biomass", quantity: 50 },
          ],
          energy: 20_000, // 20kWh to terraform
          buildTime: 300, // 300 seconds to terraform
        },
        ...action.payload,
      }
      taskAdapter.upsertOne(state, newTerraformTask)
    },
    addBuildingTask: (
      state,
      action: PayloadAction<{
        cellId: string
        slotIndex: number
        buildingType: string
        state: TaskState
        recipe: ProductRecipe
      }>,
    ) => {
      const id = `${action.payload.cellId}:BUILDING:${action.payload.slotIndex.toString()}`
      // Prevent adding duplicate building tasks for the same cell and slot
      if (taskAdapter.getSelectors().selectById(state, id)) {
        return
      }
      const newBuildingTask: BuildingTask = {
        id,
        taskType: "BUILDING",
        createdAt: Date.now(),
        startedAt: null,
        completedAt: null,
        pausedAt: null,
        isContinuous: false,
        ...action.payload,
      }
      taskAdapter.upsertOne(state, newBuildingTask)
    },
    addProductionTask: (
      state,
      action: PayloadAction<{
        cellId: string
        buildingIds: string[]
        resource: string
        isContinuous?: boolean
        recipe: ProductRecipe
      }>,
    ) => {
      const id = `${action.payload.cellId}:PRODUCTION:${action.payload.resource}`
      // Prevent adding duplicate production tasks for the same cell and buildings
      if (taskAdapter.getSelectors().selectById(state, id)) {
        return
      }

      const newProductionTask: ProductionTask = {
        id,
        taskType: "PRODUCTION",
        state: TaskState.IN_PROGRESS,
        createdAt: Date.now(),
        startedAt: Date.now(),
        completedAt: null,
        pausedAt: null,
        isContinuous: true,
        ...action.payload,
      }
      taskAdapter.upsertOne(state, newProductionTask)
    },
    startTask: (
      state,
      action: { payload: { id: string; startTime: number } },
    ) => {
      const { id, startTime } = action.payload
      taskAdapter.updateOne(state, {
        id,
        changes: { startedAt: startTime },
      })
    },
    pauseTask: (
      state,
      action: { payload: { id: string; pauseTime: number } },
    ) => {
      taskAdapter.updateOne(state, {
        id: action.payload.id,
        changes: {
          state: TaskState.PAUSED,
          pausedAt: action.payload.pauseTime,
        },
      })
    },
    resumeTask: (
      state,
      action: { payload: { id: string; resumeTime: number } },
    ) => {
      const { id, resumeTime } = action.payload
      const task = taskAdapter.getSelectors().selectById(state, id)

      if (
        !task ||
        task.state !== TaskState.PAUSED ||
        !task.pausedAt ||
        !task.startedAt
      )
        return

      // calculate the progress made before pausing
      const progress = task.pausedAt - task.startedAt
      taskAdapter.updateOne(state, {
        id,
        changes: {
          state: TaskState.IN_PROGRESS,
          startedAt: resumeTime - progress,
        },
      })
    },
    completeTask: (state, action: { payload: Task }) => {
      const { id } = action.payload
      if (action.payload.isContinuous) {
        taskAdapter.updateOne(state, {
          id,
          changes: {
            completedAt: null,
            startedAt: Date.now(),
            pausedAt: null,
            state: TaskState.IN_PROGRESS,
          },
        })
      } else {
        taskAdapter.updateOne(state, {
          id,
          changes: {
            completedAt: Date.now(),
            state: TaskState.COMPLETED,
          },
        })
      }
    },
    removeTask: (state, action: { payload: { id: string } }) => {
      taskAdapter.removeOne(state, action.payload.id)
    },
  },
  selectors: {
    getTasks: state => taskAdapter.getSelectors().selectAll(state),
    getTaskById: (state, id: string) =>
      taskAdapter.getSelectors().selectById(state, id),
  },
  extraReducers: builder => {
    builder.addCase(gameSlice.actions.resumeGame, (state, action) => {
      const changes: Array<{ id: string; changes: Partial<TaskBase> }> = []

      for (const task of taskAdapter.getSelectors().selectAll(state)) {
        if (task.state === TaskState.IN_PROGRESS && task.startedAt) {
          changes.push({
            id: task.id,
            changes: {
              startedAt: task.startedAt + action.payload.offset,
            },
          })
        }
      }

      taskAdapter.updateMany(state, changes)
    })
  },
})

export const {
  addBuildingTask,
  addTerraformTask,
  addProductionTask,
  startTask,
  pauseTask,
  resumeTask,
  completeTask,
  removeTask,
} = TaskSlice.actions

export const { getTasks, getTaskById } = TaskSlice.selectors
export const { selectAll: selectAllTasks, selectById: selectTaskById } =
  taskAdapter.getSelectors<RootState>(s => s.task)

export const selectAllActiveTasks = createDraftSafeSelector(
  [(state: RootState) => selectAllTasks(state)],
  tasks =>
    tasks.filter(
      task =>
        task.state === TaskState.PENDING ||
        task.state === TaskState.IN_PROGRESS ||
        task.state === TaskState.PAUSED,
    ),
)

export const selectAllInProgressTasks = createDraftSafeSelector(
  [(state: RootState) => selectAllTasks(state)],
  tasks => tasks.filter(task => task.state === TaskState.IN_PROGRESS),
)

export const selectTerraformingTask = createDraftSafeSelector(
  [
    (state: RootState) => selectAllInProgressTasks(state),
    (_, cellId: string) => cellId,
  ],
  (tasks, cellId) =>
    tasks.find(task => task.taskType === "TERRAFORM" && task.cellId === cellId),
)

export const selectBuildingTasks = createDraftSafeSelector(
  [
    (state: RootState) => selectAllInProgressTasks(state),
    (_, cellId: string) => cellId,
  ],
  (tasks, cellId) =>
    tasks.filter(
      task => task.taskType === "BUILDING" && task.cellId === cellId,
    ),
)

export const selectProductionTask = createDraftSafeSelector(
  [
    (state: RootState) => selectAllInProgressTasks(state),
    (_, cellId: string) => cellId,
    (_, __, resource: string) => resource,
  ],
  (tasks, cellId, resource) =>
    tasks.find(
      task =>
        task.taskType === "PRODUCTION" &&
        task.cellId === cellId &&
        task.resource === resource,
    ),
)
