export interface Model {
  id: string
  title: string
  category?: string
  likes: number
  downloads: number
  status: 'published' | 'verification' | 'rejected'
  createdAt: string
  rejectionReason?: string
  adminNotes?: string
}