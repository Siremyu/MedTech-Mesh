// types/api-responses.ts

export interface APIResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  error?: string
  details?: any
}

export interface ModelAPIResponse {
  id: string
  title: string
  description: string
  category: string
  tags: string[]
  coverImageUrl?: string
  likes: number
  downloads: number
  views: number
  author: {
    id: string
    name: string
    username: string
    avatarUrl?: string
  }
  createdAt: string
  publishedAt?: string
}

export interface ProductModelAPIResponse extends ModelAPIResponse {
  modelFileUrl?: string
  license: string
  nsfwContent: boolean
  status: string
  timestamps: {
    createdAt: string
    updatedAt: string
    publishedAt?: string
  }
  relatedModels: Array<{
    id: string
    title: string
    coverImageUrl?: string
    likes: number
    downloads: number
    author: string
  }>
  permissions: {
    canEdit: boolean
    canDownload: boolean
    canLike: boolean
  }
}

export interface PaginationResponse {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}