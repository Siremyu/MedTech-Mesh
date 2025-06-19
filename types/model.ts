export interface User {
  id: string
  email: string
  username: string
  displayName: string
  avatarUrl?: string
  bio?: string
  location?: string
  website?: string
  region?: string
  isVerified: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Model {
  id: string
  title: string
  description?: string
  category: string
  tags?: string[]
  author?: string
  downloads: number
  likes: number
  views?: number
  status: 'published' | 'verification' | 'rejected'
  createdAt: string | Date // Accept both string and Date
  publishedAt?: string | Date | null // Accept both string and Date
  rejectionReason?: string
  adminNotes?: string
  imageUrl?: string
  modelFileUrl?: string
  coverImageUrl?: string
  previewImages?: string[]
  visibility?: string
  nsfwContent?: boolean
  communityPost?: boolean
  license?: string
}