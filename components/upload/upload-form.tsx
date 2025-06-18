"use client"

import * as React from "react"
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/lib/store'
import { 
  setFiles, 
  setCoverImage, 
  setModelPictures, 
  updateModelInformation,
  setUploading,
  setUploadProgress,
  resetUpload,
  setModelFile,
  setLoading
} from '@/lib/features/upload/uploadSlice'
import { Button } from "@/components/ui/button"
import { FileUploadArea } from "./file-upload-area"
import { ModelPicturesSection } from "./model-pictures-section"
import { ModelInformationSection } from "./model-information-section"

export function UploadForm() {
  const dispatch = useDispatch<AppDispatch>()
  const { 
    files, 
    coverImage, 
    modelPictures, 
    modelFile,
    modelInformation, 
    uploading, 
    uploadProgress 
  } = useSelector((state: RootState) => state.upload)

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

  const handlePublish = async () => {
    dispatch(setUploading(true))
    
    try {
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        dispatch(setUploadProgress(i))
        await new Promise(resolve => setTimeout(resolve, 200))
      }
      
      // Handle actual upload logic here
      console.log("Publishing model:", {
        files,
        coverImage,
        modelPictures,
        modelFile,
        information: modelInformation
      })
      
      // Reset form after successful upload
      dispatch(resetUpload())
      
    } catch (error) {
      console.error("Upload failed:", error)
    } finally {
      dispatch(setUploading(false))
      dispatch(setUploadProgress(0))
    }
  }

  return (
    <>
      <div className="space-y-6">
        <FileUploadArea onFilesChange={handleFilesChange} />
        <ModelPicturesSection 
          onCoverChange={handleCoverChange}
          onPicturesChange={handlePicturesChange}
          onModelFileChange={handleModelFileChange}
        />
        <ModelInformationSection onDataChange={handleInformationChange} />
      </div>
      
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg z-50">
        <div className="flex justify-center py-4 px-[52px]">
          <Button 
            size="lg" 
            className="px-12 py-3 text-lg font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-md"
            onClick={handlePublish}
            disabled={uploading || files.length === 0}
          >
            {uploading ? `Publishing... ${uploadProgress}%` : 'Publish'}
          </Button>
        </div>
      </div>
    </>
  )
}