'use client'

import React from 'react'
import { Download, Heart, Upload } from 'lucide-react'
import { Model } from '@/types/model'

interface PublishedModelsProps {
  models: Model[]
  onModelClick: (modelId: string) => void
}

export function PublishedModels({ models, onModelClick }: PublishedModelsProps) {
  const publishedModels = models.filter(model => model.status === 'published')

  if (publishedModels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-8 text-center">
        <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-full p-6 mb-6">
          <Upload className="w-10 h-10 text-green-600" />
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-3">
          No Published Models Yet
        </h3>
        
        <p className="text-gray-600 max-w-md mb-4">
          Your verified and published models will appear here. Upload your first model to get started!
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {publishedModels.map((model, index) => (
        <div 
          key={index}
          className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onModelClick(model.id)}
        >
          {/* Model Image */}
          <div className="rounded-[4px] h-[160px] bg-gray-400 relative">
            <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
              Published
            </div>
          </div>
          
          {/* Model Info */}
          <div className="p-4">
            <h3 className="font-semibold">{model.title}</h3>
            <p className="text-gray-600 text-sm mt-1">{model.category}</p>
            <p className="text-gray-500 text-xs mt-1">Published {model.createdAt}</p>
            
            {/* Stats */}
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                {model.likes}
              </span>
              <span className="flex items-center gap-1">
                <Download className="w-4 h-4" />
                {model.downloads}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}