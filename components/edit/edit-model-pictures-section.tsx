"use client"

import * as React from "react"
import { useSelector } from 'react-redux'
import { RootState } from '@/lib/store'
import { Upload, Plus, X, FileArchive } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

interface EditModelPicturesSectionProps {
  onCoverChange: (file: File | null) => void
  onPicturesChange: (files: File[]) => void
  onModelFileChange?: (file: File | null) => void
}

export function EditModelPicturesSection({ 
  onCoverChange, 
  onPicturesChange,
  onModelFileChange 
}: EditModelPicturesSectionProps) {
  const { originalData } = useSelector((state: RootState) => state.edit)
  const [coverImage, setCoverImage] = React.useState<File | null>(null)
  const [modelPictures, setModelPictures] = React.useState<File[]>([])
  const [modelFile, setModelFile] = React.useState<File | null>(null)
  const coverInputRef = React.useRef<HTMLInputElement>(null)
  const picturesInputRef = React.useRef<HTMLInputElement>(null)
  const modelFileInputRef = React.useRef<HTMLInputElement>(null)

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setCoverImage(file)
    onCoverChange(file)
  }

  const handlePicturesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const updatedPictures = [...modelPictures, ...files]
    setModelPictures(updatedPictures)
    onPicturesChange(updatedPictures)
  }

  const handleModelFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setModelFile(file)
    onModelFileChange?.(file)
  }

  const removePicture = (index: number) => {
    const updatedPictures = modelPictures.filter((_, i) => i !== index)
    setModelPictures(updatedPictures)
    onPicturesChange(updatedPictures)
  }

  const removeModelFile = () => {
    setModelFile(null)
    onModelFileChange?.(null)
    if (modelFileInputRef.current) {
      modelFileInputRef.current.value = ''
    }
  }

  const createImageUrl = (file: File) => {
    return URL.createObjectURL(file)
  }

  const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toUpperCase()
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <Card className="mb-6 shadow-none">
      <CardHeader>
        <CardTitle>Model Pictures</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Model Cover */}
        <div>
          <Label className="text-base font-medium mb-3 block">Model Cover</Label>
          <p className="text-sm text-muted-foreground mb-3">
            Please use real print photos
          </p>
          <p className="text-sm text-red-500 mb-4">* Web cover</p>
          
          <div 
            className="w-[221px] aspect-[4/3] border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors flex flex-col items-center justify-center"
            onClick={() => coverInputRef.current?.click()}
          >
            {coverImage ? (
              <div className="relative">
                <img 
                  src={createImageUrl(coverImage)} 
                  alt="Cover preview"
                  className="mx-auto max-h-32 rounded"
                />
                <p className="mt-2 text-sm font-medium">{coverImage.name}</p>
              </div>
            ) : (
              <>
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">4:3 Cover</p>
                {originalData?.coverUrl && (
                  <p className="text-xs text-blue-600 mt-2">Previous cover available</p>
                )}
              </>
            )}
          </div>
          
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            onChange={handleCoverChange}
            className="hidden"
          />
        </div>

        {/* Model Pictures */}
        <div>
          <Label className="text-base font-medium mb-3 block">
            Model Pictures ({modelPictures.length}/16)
          </Label>
          <p className="text-sm text-muted-foreground mb-4">
            Photos of printed project (image file) and/or for 3d Viewer (Optional but recommended, stl/glb/gltf files)
          </p>
          
          <div className="flex gap-[48px] flex-wrap">
            {/* Add Picture Buttons */}
            <div 
              className="w-[162px] aspect-[1189/669] border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors flex flex-col items-center justify-center"
              onClick={() => picturesInputRef.current?.click()}
            >
              <Plus className="h-6 w-6 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Add Picture</p>
            </div>
            
            {/* Upload 3D Model */}
            <div 
              className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors w-[162px] aspect-[1189/669] flex flex-col items-center justify-center relative"
              onClick={() => modelFileInputRef.current?.click()}
            >
              {modelFile ? (
                <div className="relative w-full h-full flex flex-col items-center justify-center">
                  <FileArchive className="h-8 w-8 text-muted-foreground mb-2" />
                  <Badge variant="secondary" className="mb-2">
                    {getFileExtension(modelFile.name)}
                  </Badge>
                  <p className="text-xs font-medium text-center break-words px-2">
                    {modelFile.name.length > 20 
                      ? `${modelFile.name.substring(0, 20)}...` 
                      : modelFile.name
                    }
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatFileSize(modelFile.size)}
                  </p>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-5 w-5"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeModelFile()
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <>
                  <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground font-medium">Upload 3D Model</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    STL, GLB, GLTF
                  </p>
                  {originalData?.modelFileUrl && (
                    <p className="text-xs text-muted-foreground mt-2">Previous model available</p>
                  )}
                </>
              )}
            </div>

            {/* Uploaded Pictures */}
            {modelPictures.map((picture, index) => (
              <div key={index} className="relative w-[162px] aspect-[1189/669]">
                <img 
                  src={createImageUrl(picture)} 
                  alt={`Model picture ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6"
                  onClick={() => removePicture(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
                <Badge 
                  variant="secondary" 
                  className="absolute bottom-2 left-2 text-xs"
                >
                  IMG
                </Badge>
              </div>
            ))}
          </div>
          
          <input
            ref={picturesInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handlePicturesChange}
            className="hidden"
          />

          {/* 3D Model File Input */}
          <input
            ref={modelFileInputRef}
            type="file"
            accept=".stl,.glb,.gltf,.obj"
            onChange={handleModelFileChange}
            className="hidden"
          />
        </div>

        {/* 3D Model Info */}
        {modelFile && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <FileArchive className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">3D Model Uploaded</span>
            </div>
            <div className="text-sm text-blue-700">
              <p><strong>File:</strong> {modelFile.name}</p>
              <p><strong>Size:</strong> {formatFileSize(modelFile.size)}</p>
              <p><strong>Type:</strong> {getFileExtension(modelFile.name)} Model</p>
            </div>
            <p className="text-xs text-blue-600 mt-2">
              ✓ This model will be available for 3D preview on your product page
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}