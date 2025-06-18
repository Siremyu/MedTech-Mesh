'use client'

import React, { useState } from 'react'
import { ModelViewer } from './model-viewer'
import { Button } from '@/components/ui/button'
import { Box, Image as ImageIcon } from 'lucide-react'

interface PreviewSelectorProps {
  modelUrl?: string
  imageUrl?: string
  images?: string[]
  className?: string
}

export function PreviewSelector({ 
  modelUrl, 
  imageUrl, 
  images = [], 
  className 
}: PreviewSelectorProps) {
  const [previewMode, setPreviewMode] = useState<'3d' | 'image'>(() => {
    // Auto-select 3D if model is available, otherwise image
    return modelUrl ? '3d' : 'image'
  })
  
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  
  const currentImageUrl = imageUrl || images[selectedImageIndex] || '/placeholder.jpg'
  
  return (
    <div className={`relative ${className}`}>
      {/* Main Preview Area */}
      <div className="w-full h-full relative">
        {previewMode === '3d' ? (
          <ModelViewer 
            modelUrl={modelUrl} 
            imageUrl={currentImageUrl}
            className="w-full h-full"
          />
        ) : (
          <div className="w-full h-full relative">
            <img 
              src={currentImageUrl} 
              alt="Model Preview" 
              className="w-full h-full object-cover rounded-[4px]"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = '/placeholder.jpg'
              }}
            />
            <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded text-sm">
              Image Preview {images.length > 1 ? `(${selectedImageIndex + 1}/${images.length})` : ''}
            </div>
          </div>
        )}
        
        {/* Top Controls */}
        <div className="absolute top-4 right-4 flex gap-2">
          {modelUrl && (
            <Button
              size="sm"
              variant={previewMode === '3d' ? 'default' : 'secondary'}
              onClick={() => setPreviewMode('3d')}
              className="bg-black/70 hover:bg-black/80 text-white border-none"
            >
              <Box className="w-4 h-4 mr-1" />
              3D
            </Button>
          )}
          
          {(imageUrl || images.length > 0) && (
            <Button
              size="sm"
              variant={previewMode === 'image' ? 'default' : 'secondary'}
              onClick={() => setPreviewMode('image')}
              className="bg-black/70 hover:bg-black/80 text-white border-none"
            >
              <ImageIcon className="w-4 h-4 mr-1" />
              Image
            </Button>
          )}
        </div>
        
        {/* Image Navigation Controls */}
        {previewMode === 'image' && images.length > 1 && (
          <div className="absolute bottom-4 right-4 flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setSelectedImageIndex(Math.max(0, selectedImageIndex - 1))}
              disabled={selectedImageIndex === 0}
              className="bg-black/70 hover:bg-black/80 text-white border-none"
              aria-label="Previous image"
            >
              ←
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setSelectedImageIndex(Math.min(images.length - 1, selectedImageIndex + 1))}
              disabled={selectedImageIndex === images.length - 1}
              className="bg-black/70 hover:bg-black/80 text-white border-none"
              aria-label="Next image"
            >
              →
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}