import type { Action, ThunkAction } from "@reduxjs/toolkit"
import { combineSlices, configureStore } from "@reduxjs/toolkit"
import { playerSlice } from "@/features/player/PlayerSlice"
import {
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  persistReducer,
  persistStore,
} from "redux-persist"
import storage from "redux-persist/lib/storage" // LocalStorage

import { planetSlice } from "@/features/planet/planetSlice"
import { cellSlice } from "@/features/cell/cellSlice"
import { gameSlice } from "@/features/game/gameSlice"
import { buildingSlice } from "@/features/building/buildingSlice"
import { productionSlice } from "@/features/production/productionSlice"
import { producerSlice } from "@/features/production/producerSlice"
import { warehouseSlice } from "@/features/warehouse/warehouseSlice"
import { habitatSlice } from "@/features/habitat/habitatSlice"
import { researchSlice } from "@/features/research/researchSlice"

const persistConfig = {
  key: "root",
  version: 1,
  storage,
  whitelist: [],
  // whitelist: ["player", "game", "cell", "planet"], // Only persist these slices
}

// `combineSlices` automatically combines the reducers using
// their `reducerPath`s, therefore we no longer need to call `combineReducers`.
const rootReducer = combineSlices(
  planetSlice,
  playerSlice,
  cellSlice,
  gameSlice,
  buildingSlice,
  productionSlice,
  producerSlice,
  warehouseSlice,
  habitatSlice,
  researchSlice,
)

const persistedReducer = persistReducer(persistConfig, rootReducer)

// Infer the `RootState` type from the root reducer
export type RootState = ReturnType<typeof rootReducer>

// The store setup is wrapped in `makeStore` to allow reuse
// when setting up tests that need the same store config
export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})

export const persistor = persistStore(store)

// Infer the type of `store`
export type AppStore = typeof store
// Infer the `AppDispatch` type from the store itself
export type AppDispatch = AppStore["dispatch"]
export type AppThunk<ThunkReturnType = void> = ThunkAction<
  ThunkReturnType,
  RootState,
  unknown,
  Action
>
