"use client"

import * as React from "react"
import { Upload, Plus, X, FileArchive, Image } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

interface ModelPicturesSectionProps {
  onCoverChange?: (file: File | null) => void
  onPicturesChange?: (files: File[]) => void
  onModelFileChange?: (file: File | null) => void
}

export function ModelPicturesSection({ 
  onCoverChange, 
  onPicturesChange,
  onModelFileChange 
}: ModelPicturesSectionProps) {
  const [coverImage, setCoverImage] = React.useState<File | null>(null)
  const [pictures, setPictures] = React.useState<File[]>([])
  const [modelFile, setModelFile] = React.useState<File | null>(null)
  const [coverPreview, setCoverPreview] = React.useState<string | null>(null)
  const [picturesPreviews, setPicturesPreviews] = React.useState<string[]>([])

  // Safe image validation
  const isValidImageUrl = (url: string | null | undefined): boolean => {
    return !!(url && typeof url === 'string' && url.trim().length > 0 && !url.includes('undefined'))
  }

  // Handle cover image change with better error handling
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file before processing
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file')
        return
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('Image file is too large. Maximum size is 10MB')
        return
      }

      setCoverImage(file)
      onCoverChange?.(file)
      
      // Generate preview safely
      try {
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result
          if (typeof result === 'string' && result.length > 0) {
            setCoverPreview(result)
          }
        }
        reader.onerror = () => {
          console.error('Failed to read cover image file')
          toast.error('Failed to preview image')
        }
        reader.readAsDataURL(file)
      } catch (error) {
        console.error('Error creating FileReader for cover:', error)
        toast.error('Failed to process image')
      }
    }
  }

  // Handle pictures change with better validation
  const handlePicturesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      // Validate each file
      const validFiles = files.filter(file => {
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not a valid image file`)
          return false
        }
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 10MB)`)
          return false
        }
        return true
      })

      if (validFiles.length === 0) return

      setPictures(prev => [...prev, ...validFiles])
      onPicturesChange?.(validFiles)
      
      // Generate previews safely
      validFiles.forEach(file => {
        try {
          const reader = new FileReader()
          reader.onload = (e) => {
            const result = e.target?.result
            if (typeof result === 'string' && result.length > 0) {
              setPicturesPreviews(prev => [...prev, result])
            }
          }
          reader.onerror = () => {
            console.error(`Failed to read file: ${file.name}`)
          }
          reader.readAsDataURL(file)
        } catch (error) {
          console.error(`Error processing file ${file.name}:`, error)
        }
      })
    }
  }

  // Handle model file change with validation
  const handleModelFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file extension
      const validExtensions = ['.blend', '.stl', '.obj', '.ply', '.fbx', '.gltf', '.glb', '.dae', '.3ds']
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
      
      if (!validExtensions.includes(fileExtension)) {
        toast.error(`Unsupported file format. Supported: ${validExtensions.join(', ')}`)
        return
      }

      if (file.size > 100 * 1024 * 1024) { // 100MB limit
        toast.error('Model file is too large. Maximum size is 100MB')
        return
      }

      if (file.size === 0) {
        toast.error('Selected file appears to be empty')
        return
      }

      setModelFile(file)
      onModelFileChange?.(file)
      toast.success(`Model file "${file.name}" added successfully`)
    }
  }

  // Remove picture with index validation
  const removePicture = (index: number) => {
    if (index < 0 || index >= pictures.length) {
      console.warn('Invalid picture index:', index)
      return
    }

    setPictures(prev => prev.filter((_, i) => i !== index))
    setPicturesPreviews(prev => prev.filter((_, i) => i !== index))
    toast.success('Picture removed')
  }

  // Remove cover image
  const removeCoverImage = () => {
    setCoverImage(null)
    setCoverPreview(null)
    onCoverChange?.(null)
    toast.success('Cover image removed')
  }

  // Remove model file
  const removeModelFile = () => {
    setModelFile(null)
    onModelFileChange?.(null)
    toast.success('Model file removed')
  }

  return (
    <div className="space-y-6">
      {/* Cover Image Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="w-5 h-5" />
            Cover Image
          </CardTitle>
        </CardHeader>
        <CardContent>
          {coverImage && isValidImageUrl(coverPreview) ? (
            <div className="relative">
              <img 
                src={coverPreview!} 
                alt="Cover preview"
                className="w-full h-48 object-cover rounded-lg border"
                onError={(e) => {
                  console.error('Cover image failed to load')
                  // Remove the broken image
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                }}
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={removeCoverImage}
              >
                <X className="w-4 h-4" />
              </Button>
              <div className="mt-2">
                <Badge variant="secondary">{coverImage.name}</Badge>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 mb-4">Upload a cover image for your model</p>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleCoverChange}
                className="hidden"
                id="cover-upload"
              />
              <Button asChild variant="outline">
                <label htmlFor="cover-upload" className="cursor-pointer">
                  Choose Cover Image
                </label>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gallery Pictures Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="w-5 h-5" />
            Gallery Pictures ({pictures.length}/10)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pictures.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {pictures.map((file, index) => {
                  const previewUrl = picturesPreviews[index]
                  return (
                    <div key={`${file.name}-${index}`} className="relative">
                      {isValidImageUrl(previewUrl) ? (
                        <img 
                          src={previewUrl} 
                          alt={`Gallery ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border"
                          onError={(e) => {
                            console.error(`Gallery image ${index} failed to load`)
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                          }}
                        />
                      ) : (
                        <div className="w-full h-24 bg-gray-200 rounded-lg border flex items-center justify-center">
                          <span className="text-gray-500 text-xs">Loading...</span>
                        </div>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 w-6 h-6 p-0"
                        onClick={() => removePicture(index)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  )
                })}
              </div>
            )}
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Plus className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-gray-600 mb-4">Add more pictures to showcase your model</p>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                multiple
                onChange={handlePicturesChange}
                className="hidden"
                id="pictures-upload"
              />
              <Button asChild variant="outline" disabled={pictures.length >= 10}>
                <label htmlFor="pictures-upload" className="cursor-pointer">
                  {pictures.length >= 10 ? 'Maximum reached' : 'Add Pictures'}
                </label>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3D Model File Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileArchive className="w-5 h-5" />
            3D Model File
          </CardTitle>
        </CardHeader>
        <CardContent>
          {modelFile ? (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <FileArchive className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="font-medium">{modelFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {(modelFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={removeModelFile}
                className="text-red-600 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <FileArchive className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 mb-2">Upload your 3D model file</p>
              <p className="text-sm text-gray-500 mb-4">
                Supported formats: BLEND, STL, OBJ, PLY, FBX, GLTF, GLB
              </p>
              <input
                type="file"
                accept=".blend,.stl,.obj,.ply,.fbx,.gltf,.glb,.dae,.3ds,.max,.ma,.mb"
                onChange={handleModelFileChange}
                className="hidden"
                id="model-upload"
              />
              <Button asChild variant="outline">
                <label htmlFor="model-upload" className="cursor-pointer">
                  Choose 3D Model File
                </label>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}