"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { FileUploadArea } from "./file-upload-area"
import { ModelPicturesSection } from "./model-pictures-section"
import { ModelInformationSection } from "./model-information-section"

export function UploadForm() {
  const [uploadedFiles, setUploadedFiles] = React.useState([])
  const [coverImage, setCoverImage] = React.useState<File | null>(null)
  const [modelPictures, setModelPictures] = React.useState<File[]>([])
  const [modelInformation, setModelInformation] = React.useState({})

  const handlePublish = () => {
    // Handle form submission
    const formData = {
      files: uploadedFiles,
      coverImage,
      modelPictures,
      information: modelInformation
    }
    
    console.log("Publishing model:", formData)
    // Add your publish logic here
  }

  return (
    <>
      {/* Main Upload Content */}
      <div className="space-y-6">
        <FileUploadArea onFilesChange={setUploadedFiles} />
        <ModelPicturesSection 
          onCoverChange={setCoverImage}
          onPicturesChange={setModelPictures}
        />
        <ModelInformationSection onDataChange={setModelInformation} />
      </div>
      
      {/* Fixed Footer dengan Publish Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg z-50">
        <div className="flex justify-center py-4 px-[52px]">
          <Button 
            size="lg" 
            className="px-12 py-3 text-lg font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-md"
            onClick={handlePublish}
          >
            Publish
          </Button>
        </div>
      </div>
    </>
  )
}