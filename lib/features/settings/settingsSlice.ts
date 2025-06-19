// lib/features/settings/settingsSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UserSettings {
  displayName: string
  username: string
  email: string
  bio: string
  avatarUrl: string | null
  gender: string
  region: string
}

interface SettingsState {
  loading: boolean
  error: string | null
  userSettings: UserSettings
}

const initialState: SettingsState = {
  loading: false,
  error: null,
  userSettings: {
    displayName: '',
    username: '',
    email: '',
    bio: '',
    avatarUrl: null,
    gender: '',
    region: '',
  }
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateField: (state, action: PayloadAction<{ field: string; value: any }>) => {
      const { field, value } = action.payload
      ;(state.userSettings as any)[field] = value
    },
    saveSettingsStart: (state) => {
      state.loading = true
      state.error = null
    },
    saveSettingsSuccess: (state, action?: PayloadAction<any>) => {
      state.loading = false
      if (action?.payload) {
        state.userSettings = { ...state.userSettings, ...action.payload }
      }
    },
    saveSettingsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false
      state.error = action.payload
    },
    setUserSettings: (state, action: PayloadAction<UserSettings>) => {
      state.userSettings = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
    loadUserSettings: (state, action: PayloadAction<UserSettings>) => {
      state.userSettings = action.payload
    },
  },
})

export const {
  updateField,
  saveSettingsStart,
  saveSettingsSuccess,
  saveSettingsFailure,
  setUserSettings,
  clearError,
  loadUserSettings,
} = settingsSlice.actions

export default settingsSlice.reducer