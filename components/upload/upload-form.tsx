"use client"

import * as React from "react"
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/lib/store'
import { Button } from "@/components/ui/button"
import { FileUploadArea } from "./file-upload-area"
import { ModelPicturesSection } from "./model-pictures-section"
import { ModelInformationSection } from "./model-information-section"
import { toast } from 'sonner'
import { setIsUploading } from '@/lib/features/upload/uploadSlice'

interface UploadFile {
  id: string
  file: File
  type: 'cover' | 'gallery' | 'model'
  status: 'pending' | 'uploading' | 'completed' | 'error'
  progress: number
  preview?: string
}

interface ModelInformation {
  title: string
  category: string
  description: string
  tags: string
  visibility: 'public' | 'private'
  nsfwContent: boolean
  allowAdaptations: 'yes' | 'no'
  allowCommercialUse: 'yes' | 'no'
  allowSharing: 'yes' | 'no'
  communityPost: boolean
}

export function UploadForm() {
  const dispatch = useDispatch<AppDispatch>()
  const { isUploading } = useSelector((state: RootState) => state.upload)

  const [files, setFiles] = React.useState<UploadFile[]>([])
  const [modelInformation, setModelInformation] = React.useState<ModelInformation>({
    title: '',
    category: '',
    description: '',
    tags: '',
    visibility: 'public',
    nsfwContent: false,
    allowAdaptations: 'yes',
    allowCommercialUse: 'no',
    allowSharing: 'yes',
    communityPost: true
  })

  // Enhanced form validation
  const validateForm = React.useCallback((): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []

    // Validate model information
    if (!modelInformation.title?.trim()) {
      errors.push('Model title is required')
    } else if (modelInformation.title.trim().length < 3) {
      errors.push('Model title must be at least 3 characters')
    }

    if (!modelInformation.category?.trim()) {
      errors.push('Category selection is required')
    }

    if (!modelInformation.description?.trim()) {
      errors.push('Model description is required')
    } else if (modelInformation.description.trim().length < 10) {
      errors.push('Description must be at least 10 characters')
    }

    // Validate files
    if (files.length === 0) {
      errors.push('At least one file (cover image, gallery image, or 3D model) is required')
    }

    // Check for required file types
    const hasCoverImage = files.some(f => f.type === 'cover')
    const hasModelFile = files.some(f => f.type === 'model')
    
    if (!hasCoverImage && !hasModelFile) {
      errors.push('Either a cover image or 3D model file is required')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }, [modelInformation, files])

  // Handle model information change
  const handleInformationChange = React.useCallback((data: Partial<ModelInformation>) => {
    setModelInformation(prev => ({ ...prev, ...data }))
  }, [])

  // Handle file changes from ModelPicturesSection
  const handleCoverChange = React.useCallback((file: File | null) => {
    if (file) {
      const coverFile: UploadFile = {
        id: `cover-${Date.now()}`,
        file,
        type: 'cover',
        status: 'pending',
        progress: 0
      }
      
      // Replace existing cover
      setFiles(prev => [...prev.filter(f => f.type !== 'cover'), coverFile])
    } else {
      // Remove cover
      setFiles(prev => prev.filter(f => f.type !== 'cover'))
    }
  }, [])

  const handlePicturesChange = React.useCallback((pictures: File[]) => {
    const galleryFiles: UploadFile[] = pictures.map(file => ({
      id: `gallery-${Date.now()}-${Math.random()}`,
      file,
      type: 'gallery',
      status: 'pending',
      progress: 0
    }))
    
    setFiles(prev => [...prev.filter(f => f.type !== 'gallery'), ...galleryFiles])
  }, [])

  const handleModelFileChange = React.useCallback((file: File | null) => {
    if (file) {
      const modelFile: UploadFile = {
        id: `model-${Date.now()}`,
        file,
        type: 'model',
        status: 'pending',
        progress: 0
      }
      
      // Replace existing model file
      setFiles(prev => [...prev.filter(f => f.type !== 'model'), modelFile])
    } else {
      // Remove model file
      setFiles(prev => prev.filter(f => f.type !== 'model'))
    }
  }, [])

  // Handle publish with better error handling
  const handlePublish = async () => {
    try {
      console.log('🚀 Starting model publication...')
      
      // Validate form
      const validation = validateForm()
      if (!validation.isValid) {
        validation.errors.forEach(error => toast.error(error))
        return
      }

      dispatch(setIsUploading(true))
      
      // Prepare FormData
      const formData = new FormData()
      
      // Add model information
      Object.entries(modelInformation).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, typeof value === 'boolean' ? String(value) : String(value))
        }
      })

      // Add files
      files.forEach((uploadFile) => {
        const { file, type } = uploadFile
        
        switch (type) {
          case 'cover':
            formData.append('coverImage', file)
            break
          case 'gallery':
            formData.append('galleryImages', file)
            break
          case 'model':
            formData.append('modelFile', file)
            break
        }
      })

      console.log('🌐 Sending request to API...')
      
      const response = await fetch('/api/models/create', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })

      const responseData = await response.json()
      
      if (response.ok && responseData.success) {
        toast.success('Model published successfully!')
        
        // Reset form
        setFiles([])
        setModelInformation({
          title: '',
          category: '',
          description: '',
          tags: '',
          visibility: 'public',
          nsfwContent: false,
          allowAdaptations: 'yes',
          allowCommercialUse: 'no',
          allowSharing: 'yes',
          communityPost: true
        })
        
      } else {
        throw new Error(responseData.error || 'Failed to publish model')
      }

    } catch (error: any) {
      console.error('❌ Publish error:', error)
      toast.error(error.message || 'Failed to publish model')
    } finally {
      dispatch(setIsUploading(false))
    }
  }

  // Calculate if form can be published
  const canPublish = React.useMemo(() => {
    const validation = validateForm()
    return !isUploading && validation.isValid
  }, [isUploading, validateForm])

  return (
    <>
      <div className="space-y-6">
        {/* Model Pictures Section */}
        <ModelPicturesSection 
          onCoverChange={handleCoverChange}
          onPicturesChange={handlePicturesChange}
          onModelFileChange={handleModelFileChange}
        />
        
        {/* Model Information Section */}
        <ModelInformationSection onDataChange={handleInformationChange} />
        
        {/* File List Display */}
        {files.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-4">Uploaded Files ({files.length})</h4>
            <div className="space-y-2">
              {files.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                      <span className="text-xs text-blue-600 font-medium">
                        {file.type === 'cover' ? 'C' : file.type === 'gallery' ? 'G' : 'M'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{file.file.name}</p>
                      <p className="text-xs text-gray-500">
                        {file.type} • {(file.file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-green-600 font-medium">Ready</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Fixed Bottom Publish Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg z-50">
        <div className="flex justify-center py-4 px-[52px]">
          <Button 
            size="lg" 
            className={`px-12 py-3 text-lg font-medium shadow-md transition-all ${
              canPublish 
                ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            onClick={handlePublish}
            disabled={!canPublish}
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Publishing...
              </>
            ) : (
              'Publish Model'
            )}
          </Button>
        </div>
        
        {/* Helper text */}
        <div className="text-center pb-2">
          <p className="text-sm text-gray-500">
            {!canPublish && !isUploading && (
              files.length === 0 ? 'Upload at least one file to continue' :
              !modelInformation.title ? 'Enter a title for your model' :
              !modelInformation.category ? 'Select a category' :
              !modelInformation.description ? 'Add a description' :
              'Complete all required fields'
            )}
          </p>
        </div>
      </div>
    </>
  )
}