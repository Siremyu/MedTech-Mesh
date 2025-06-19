export interface User {
  id: string
  email: string
  username: string
  displayName: string
  avatarUrl?: string
  totalLikes?: number
  totalDownloads?: number
}

export interface AuthState {
  user: User | null
  isLoggedIn: boolean
  loading: boolean
  error: string | null
}