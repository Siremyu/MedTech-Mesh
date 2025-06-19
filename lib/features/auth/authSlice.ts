// lib/features/auth/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface User {
  id: string
  email: string
  username: string
  displayName: string
  avatarUrl?: string
  totalLikes?: number
  totalDownloads?: number
}

interface AuthState {
  user: User | null
  isLoggedIn: boolean
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  isLoggedIn: false,
  loading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true
      state.error = null
    },
    loginSuccess: (state, action: PayloadAction<User>) => {
      state.loading = false
      state.isLoggedIn = true
      state.user = action.payload
      state.error = null
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false
      state.isLoggedIn = false
      state.user = null
      state.error = action.payload
    },
    logout: (state) => {
      state.user = null
      state.isLoggedIn = false
      state.loading = false
      state.error = null
    },
    clearError: (state) => {
      state.error = null
    },
  },
})

export const { loginStart, loginSuccess, loginFailure, logout, clearError } = authSlice.actions
export default authSlice.reducer