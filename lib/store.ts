// lib/store.ts
import { configureStore } from '@reduxjs/toolkit'
import authSlice from './features/auth/authSlice'
import modelsSlice from './features/models/modelsSlice'
import uploadSlice from './features/upload/uploadSlice'
import editSlice from './features/edit/editSlice'
import settingsSlice from './features/settings/settingsSlice'

export const store = configureStore({
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
        ignoredActions: [
          'upload/setCoverImage', 
          'upload/setModelPictures', 
          'upload/addModelPicture',
          'edit/setCoverImage', 
          'edit/setModelPictures', 
          'edit/addModelPicture',
          'edit/setModelFile'
        ],
        ignoredPaths: [
          'upload.coverImage', 
          'upload.modelPictures',
          'edit.coverImage', 
          'edit.modelPictures',
          'edit.modelFile'
        ],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch