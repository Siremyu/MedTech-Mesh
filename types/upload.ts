// types/upload.ts
export interface UploadedFile {
  id: string
  originalName: string
  fileName: string
  url: string
  size: number
  compressedSize?: number
  type: 'image' | 'model' | 'document'
  mimeType: string
  uploadedAt: string
  uploadedBy: string
}

export interface UploadResponse {
  success: boolean
  message: string
  files: UploadedFile[]
  metadata: {
    category?: string
    modelId?: string
    uploadedBy: string
    uploadedAt: string
  }
}

export interface UploadError {
  error: string
  details?: string
  code?: string
}