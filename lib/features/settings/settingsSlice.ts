// lib/features/settings/settingsSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UserSettings {
  displayName: string
  username: string
  email: string
  gender: string
  region: string
  avatarUrl?: string
  notifications: {
    email: boolean
    push: boolean
    marketing: boolean
  }
  privacy: {
    profileVisible: boolean
    showEmail: boolean
    showDownloads: boolean
  }
}

interface SettingsState {
  settings: UserSettings
  loading: boolean
  error: string | null
  isDirty: boolean
}

const initialState: SettingsState = {
  settings: {
    displayName: 'Name',
    username: '@username',
    email: 'lorem@gmail.com',
    gender: 'Man',
    region: 'Konoha',
    notifications: {
      email: true,
      push: true,
      marketing: false,
    },
    privacy: {
      profileVisible: true,
      showEmail: false,
      showDownloads: true,
    },
  },
  loading: false,
  error: null,
  isDirty: false,
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateSettings: (state, action: PayloadAction<Partial<UserSettings>>) => {
      state.settings = { ...state.settings, ...action.payload }
      state.isDirty = true
    },
    updateField: (state, action: PayloadAction<{ field: keyof UserSettings; value: any }>) => {
      const { field, value } = action.payload
      state.settings[field] = value
      state.isDirty = true
    },
    saveSettingsStart: (state) => {
      state.loading = true
      state.error = null
    },
    saveSettingsSuccess: (state) => {
      state.loading = false
      state.isDirty = false
      state.error = null
    },
    saveSettingsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false
      state.error = action.payload
    },
    resetSettings: (state) => {
      state.settings = initialState.settings
      state.isDirty = false
    },
  },
})

export const {
  updateSettings,
  updateField,
  saveSettingsStart,
  saveSettingsSuccess,
  saveSettingsFailure,
  resetSettings,
} = settingsSlice.actions

export default settingsSlice.reducer