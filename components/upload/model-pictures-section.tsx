"use client"

import * as React from "react"
import { Upload, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

interface ModelPicturesSectionProps {
  onCoverChange: (file: File | null) => void
  onPicturesChange: (files: File[]) => void
}

export function ModelPicturesSection({ onCoverChange, onPicturesChange }: ModelPicturesSectionProps) {
  const [coverImage, setCoverImage] = React.useState<File | null>(null)
  const [modelPictures, setModelPictures] = React.useState<File[]>([])
  const coverInputRef = React.useRef<HTMLInputElement>(null)
  const picturesInputRef = React.useRef<HTMLInputElement>(null)

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

  const removePicture = (index: number) => {
    const updatedPictures = modelPictures.filter((_, i) => i !== index)
    setModelPictures(updatedPictures)
    onPicturesChange(updatedPictures)
  }

  const createImageUrl = (file: File) => {
    return URL.createObjectURL(file)
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
            className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
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
            Model Pictures (0/16)
          </Label>
          <p className="text-sm text-muted-foreground mb-4">
            Photos of printed project or for 3d Viewer (Optional)
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Add Picture Buttons */}
            <div 
              className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors aspect-square flex flex-col items-center justify-center"
              onClick={() => picturesInputRef.current?.click()}
            >
              <Plus className="h-6 w-6 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Add Picture</p>
            </div>
            
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors aspect-square flex flex-col items-center justify-center">
              <Upload className="h-6 w-6 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Upload</p>
            </div>

            {/* Uploaded Pictures */}
            {modelPictures.map((picture, index) => (
              <div key={index} className="relative aspect-square">
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
        </div>
      </CardContent>
    </Card>
  )
}