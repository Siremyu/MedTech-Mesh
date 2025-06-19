// types/profile.ts - Create centralized type definitions
export interface UserProfile {
  id: string
  displayName: string
  username: string
  email: string
  bio: string
  avatarUrl?: string | null
  region: string
  gender: string
  emailVerified: boolean
  memberSince: string
  lastActive: string
  stats: {
    totalLikes: number
    totalDownloads: number
    totalModels: number
    followers: number
    following: number
  }
}

export interface ProfileModel {
  id: string
  title: string
  description: string // Fix: Make required, not optional
  category: string
  tags?: string[]
  thumbnailUrl?: string
  likes: number
  downloads: number
  views: number
  status: 'published' | 'verification' | 'rejected'
  createdAt: string
  publishedAt?: string | null
  rejectionReason?: string
  adminNotes?: string
}

export type ProfileTabType = 'home' | 'collections' | '3d-models' | 'laser-cut' | 'posts' | 'ratings'

// Model stats for API response
export interface ModelStats {
  likes: number
  downloads: number
  views: number
}