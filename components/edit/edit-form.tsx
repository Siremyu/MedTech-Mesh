"use client"

import * as React from "react"
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/lib/store'
import { 
  setEditData,
  setFiles, 
  setCoverImage, 
  setModelPictures, 
  setModelFile,
  updateModelInformation,
  setUploading,
  setUploadProgress,
  setLoading,
  resetEdit 
} from '@/lib/features/edit/editSlice'
import { Button } from "@/components/ui/button"
import { EditFileUploadArea } from "./edit-file-upload-area"
import { EditModelPicturesSection } from "./edit-model-pictures-section"
import { EditModelInformationSection } from "./edit-model-information-section"

interface EditFormProps {
  modelId: string | null
}

export function EditForm({ modelId }: EditFormProps) {
  const dispatch = useDispatch<AppDispatch>()
  const { 
    files, 
    coverImage, 
    modelPictures, 
    modelFile,
    modelInformation, 
    uploading, 
    uploadProgress,
    loading 
  } = useSelector((state: RootState) => state.edit)

  React.useEffect(() => {
    if (modelId) {
      loadModelData(modelId)
    }
  }, [modelId])

  const loadModelData = async (id: string) => {
    dispatch(setLoading(true))
    
    try {
      // Simulate API call to load rejected model data
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockRejectedData = {
        id: id,
        title: "Heart Anatomy Model - REJECTED",
        description: "Detailed 3D heart model for medical education. This model was rejected due to incomplete documentation.",
        category: "Medical",
        tags: "heart, anatomy, medical, education",
        visibility: "public",
        nsfwContent: false,
        allowAdaptations: "yes",
        allowCommercialUse: "no",
        allowSharing: "yes",
        communityPost: true,
        files: [
          {
            id: "file-1",
            name: "heart_model.blend",
            size: 2450000,
            type: "application/octet-stream"
          },
          {
            id: "file-2", 
            name: "heart_texture.jpg",
            size: 850000,
            type: "image/jpeg"
          }
        ],
        rejectionReason: "Missing proper documentation and licensing information"
      }
      
      dispatch(setEditData(mockRejectedData))
    } catch (error) {
      console.error("Failed to load model data:", error)
    } finally {
      dispatch(setLoading(false))
    }
  }

  const handleFilesChange = (newFiles: any[]) => {
    dispatch(setFiles(newFiles))
  }

  const handleCoverChange = (file: File | null) => {
    dispatch(setCoverImage(file))
  }

  const handlePicturesChange = (pictures: File[]) => {
    dispatch(setModelPictures(pictures))
  }

  const handleModelFileChange = (file: File | null) => {
    dispatch(setModelFile(file))
  }

  const handleInformationChange = (data: any) => {
    dispatch(updateModelInformation(data))
  }

  const handleUpdate = async () => {
    dispatch(setUploading(true))
    
    try {
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        dispatch(setUploadProgress(i))
        await new Promise(resolve => setTimeout(resolve, 200))
      }
      
      // Handle actual update logic here
      console.log("Updating model:", {
        modelId,
        files,
        coverImage,
        modelPictures,
        modelFile,
        information: modelInformation
      })
      
      // Reset form after successful update
      dispatch(resetEdit())
      
    } catch (error) {
      console.error("Update failed:", error)
    } finally {
      dispatch(setUploading(false))
      dispatch(setUploadProgress(0))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg">Loading model data...</div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        <EditFileUploadArea onFilesChange={handleFilesChange} />
        <EditModelPicturesSection 
          onCoverChange={handleCoverChange}
          onPicturesChange={handlePicturesChange}
          onModelFileChange={handleModelFileChange}
        />
        <EditModelInformationSection onDataChange={handleInformationChange} />
      </div>
      
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg z-50">
        <div className="flex justify-center py-4 px-[52px]">
          <Button 
            size="lg" 
            className="px-12 py-3 text-lg font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-md"
            onClick={handleUpdate}
            disabled={uploading || files.length === 0}
          >
            {uploading ? `Updating... ${uploadProgress}%` : 'Update Model'}
          </Button>
        </div>
      </div>
    </>
  )
}