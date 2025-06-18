// lib/features/auth/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface User {
  id: string
  email: string
  displayName: string
  username: string
  avatarUrl?: string
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
      state.error = action.payload
    },
    logout: (state) => {
      state.user = null
      state.isLoggedIn = false
      state.error = null
    },
    updateProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
      }
    },
  },
})

export const { loginStart, loginSuccess, loginFailure, logout, updateProfile } = authSlice.actions
export default authSlice.reducer