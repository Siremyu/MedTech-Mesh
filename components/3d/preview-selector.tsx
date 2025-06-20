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
  const [previewMode, setPreviewMode] = useState<'3d' | 'image'>('image')
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  // Determine what content to show
  const hasModel = modelUrl && modelUrl.trim().length > 0
  const hasImages = images.length > 0 || (imageUrl && imageUrl.trim().length > 0)
  const allImages = images.length > 0 ? images : (imageUrl ? [imageUrl] : [])

  // Auto-switch to 3D if available and no images
  React.useEffect(() => {
    if (hasModel && !hasImages) {
      setPreviewMode('3d')
    } else if (!hasModel && hasImages) {
      setPreviewMode('image')
    }
  }, [hasModel, hasImages])

  return (
    <div className={`relative bg-gray-900 ${className}`}>
      {/* 3D Model Preview */}
      {previewMode === '3d' && hasModel && (
        <div className="w-full h-full">
          <ModelViewer
            modelUrl={modelUrl}
            className="w-full h-full"
          />
          <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded text-sm">
            3D Preview • Click & drag to rotate
          </div>
        </div>
      )}

      {/* Image Preview */}
      {previewMode === 'image' && hasImages && (
        <div className="w-full h-full relative">
          <img
            src={allImages[selectedImageIndex]}
            alt={`Preview ${selectedImageIndex + 1}`}
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
        {hasModel && (
          <Button
            size="sm"
            variant={previewMode === '3d' ? 'default' : 'secondary'}
            onClick={() => setPreviewMode('3d')}
            className="text-xs"
          >
            <Box className="w-3 h-3 mr-1" />
            3D
          </Button>
        )}
        {hasImages && (
          <Button
            size="sm"
            variant={previewMode === 'image' ? 'default' : 'secondary'}
            onClick={() => setPreviewMode('image')}
            className="text-xs"
          >
            <ImageIcon className="w-3 h-3 mr-1" />
            Image
          </Button>
        )}
      </div>

      {/* Image Navigation */}
      {previewMode === 'image' && allImages.length > 1 && (
        <div className="absolute bottom-4 right-4 flex gap-1">
          {allImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setSelectedImageIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === selectedImageIndex ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      )}

      {/* No Content Fallback */}
      {!hasModel && !hasImages && (
        <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
          <div className="text-center">
            <Box className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No preview available</p>
          </div>
        </div>
      )}
    </div>
  )
}