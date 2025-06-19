// lib/store.ts
import { configureStore } from '@reduxjs/toolkit'
import authSlice from './features/auth/authSlice'
import modelsSlice from './features/models/modelsSlice'
import uploadSlice from './features/upload/uploadSlice'
import editSlice from './features/edit/editSlice'
import settingsSlice from './features/settings/settingsSlice'

export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authSlice,
      models: modelsSlice,
      upload: uploadSlice,
      edit: editSlice,
      settings: settingsSlice,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ['persist/PERSIST'],
        },
      }),
  })
}

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']