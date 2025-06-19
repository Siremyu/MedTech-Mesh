// components/profile/tabs/components/model-card.tsx
import React from 'react'
import { Clock, Heart, Download } from 'lucide-react'

interface ModelCardProps {
  model: {
    id: string
    title: string
    description: string
    thumbnailUrl?: string
    likes: number
    downloads: number
    createdAt: string
  }
  onClick: () => void
  showStatus?: boolean
}

export function ModelCard({ model, onClick, showStatus = false }: ModelCardProps) {
  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      {/* Model Thumbnail */}
      <div className="h-48 bg-gray-100 flex items-center justify-center">
        {model.thumbnailUrl ? (
          <img 
            src={model.thumbnailUrl} 
            alt={model.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-gray-400 text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-2"></div>
            <p className="text-sm">No Preview</p>
          </div>
        )}
      </div>

      {/* Model Info */}
      <div className="p-4">
        <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
          {model.title}
        </h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {model.description}
        </p>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              <span>{model.likes}</span>
            </div>
            <div className="flex items-center gap-1">
              <Download className="w-4 h-4" />
              <span>{model.downloads}</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{model.createdAt}</span>
          </div>
        </div>
      </div>
    </div>
  )
}