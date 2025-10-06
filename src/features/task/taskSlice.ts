import { createAppSlice } from "@/app/createAppSlice"
import {
  type Action,
  createDraftSafeSelector,
  createEntityAdapter,
  type PayloadAction,
} from "@reduxjs/toolkit"
import { gameSlice } from "../game/gameSlice"
import { type RootState } from "@/app/store"
import { type Task, TaskState } from "./types"

const taskAdapter = createEntityAdapter<Task>({
  sortComparer: (a, b) => a.createdAt - b.createdAt,
})

export const TaskSlice = createAppSlice({
  name: "task",
  initialState: taskAdapter.getInitialState(),
  reducers: {
    addTask: (
      state,
      action: PayloadAction<{
        id: string
        description: string
        duration: number
        energyUsage: number
        action: Action
        isContinuous?: boolean
        state?: TaskState
      }>,
    ) => {
      // Prevent adding duplicate terraform tasks for the same cell
      if (taskAdapter.getSelectors().selectById(state, action.payload.id)) {
        return
      }
      const taskState = action.payload.state ?? TaskState.IN_PROGRESS
      const isContinuous = action.payload.isContinuous ?? false
      const newTask: Task = {
        createdAt: Date.now(),
        startedAt: taskState === TaskState.IN_PROGRESS ? Date.now() : null,
        completedAt: null,
        pausedAt: null,
        ...action.payload,
        state: taskState,
        isContinuous,
      }
      taskAdapter.upsertOne(state, newTask)
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
      const changes: Array<{ id: string; changes: Partial<Task> }> = []

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
  addTask,
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

export const selectTaskStartingWith = createDraftSafeSelector(
  [(state: RootState) => selectAllTasks(state), (_, prefix: string) => prefix],
  (tasks, prefix) =>
    tasks.filter(
      task =>
        task.state === TaskState.IN_PROGRESS && task.id.startsWith(prefix),
    ),
)
