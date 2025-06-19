// lib/hooks/use-upload.ts
import { useState, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@/lib/store'
import { setIsUploading, setError } from '@/lib/features/upload/uploadSlice'
import { toast } from 'sonner'

interface UploadProgress {
  fileName: string
  progress: number
  status: 'pending' | 'uploading' | 'completed' | 'error'
  error?: string
}

interface UseUploadReturn {
  uploadFiles: (files: File[], category?: string) => Promise<any[]>
  progress: UploadProgress[]
  isUploading: boolean
  resetProgress: () => void
}

export function useUpload(): UseUploadReturn {
  const dispatch = useDispatch<AppDispatch>()
  const [progress, setProgress] = useState<UploadProgress[]>([])
  const [isUploading, setLocalUploading] = useState(false)

  const uploadFiles = useCallback(async (files: File[], category = 'model') => {
    console.log('🚀 useUpload - Starting upload:', { filesCount: files.length, category })
    
    setLocalUploading(true)
    dispatch(setIsUploading(true))
    dispatch(setError(null))
    
    // Initialize progress tracking
    const initialProgress = files.map(file => ({
      fileName: file.name,
      progress: 0,
      status: 'pending' as const
    }))
    setProgress(initialProgress)

    try {
      // Validate files before upload
      for (const file of files) {
        if (file.size > 50 * 1024 * 1024) {
          throw new Error(`File "${file.name}" exceeds 50MB limit`)
        }
        if (file.size === 0) {
          throw new Error(`File "${file.name}" is empty`)
        }
      }

      const formData = new FormData()
      
      // Add files to form data with proper indexing
      files.forEach((file, index) => {
        formData.append(`file${index}`, file)
      })
      
      formData.append('category', category)

      // Update progress to uploading
      setProgress(prev => prev.map(p => ({ ...p, status: 'uploading' })))

      console.log('📤 useUpload - Sending request to /api/upload')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      console.log('📡 useUpload - Response status:', response.status)

      if (!response.ok) {
        let errorMessage = 'Upload failed'
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
          console.error('❌ useUpload - Server error:', errorData)
        } catch (parseError) {
          console.error('❌ useUpload - Failed to parse error response:', parseError)
        }
        throw new Error(errorMessage)
      }

      const result = await response.json()
      console.log('✅ useUpload - Upload successful:', {
        filesUploaded: result.files?.length,
        success: result.success
      })

      // Update progress to completed
      setProgress(prev => prev.map(p => ({ 
        ...p, 
        progress: 100, 
        status: 'completed' 
      })))

      toast.success(`Successfully uploaded ${files.length} files`)
      return result.files || []

    } catch (error: any) {
      console.error('❌ useUpload - Upload error:', error)
      
      // Update progress to error with specific error message
      setProgress(prev => prev.map(p => ({ 
        ...p, 
        status: 'error',
        error: error.message 
      })))
      
      dispatch(setError(error.message || 'Upload failed'))
      
      // Show user-friendly error message
      if (error.message?.includes('exceeds')) {
        toast.error(error.message)
      } else if (error.message?.includes('Authentication')) {
        toast.error('Please login to upload files')
      } else if (error.message?.includes('Server configuration')) {
        toast.error('Server is temporarily unavailable. Please try again later.')
      } else {
        toast.error(error.message || 'Upload failed. Please try again.')
      }
      
      throw error
      
    } finally {
      setLocalUploading(false)
      dispatch(setIsUploading(false))
    }
  }, [dispatch])

  const resetProgress = useCallback(() => {
    setProgress([])
    setLocalUploading(false)
    dispatch(setIsUploading(false))
    dispatch(setError(null))
  }, [dispatch])

  return {
    uploadFiles,
    progress,
    isUploading,
    resetProgress
  }
}