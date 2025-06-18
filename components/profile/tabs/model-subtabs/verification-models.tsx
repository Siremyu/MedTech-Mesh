'use client'

import React from 'react'
import { Clock, Eye, Upload } from 'lucide-react'
import { Model } from '@/types/model'

interface VerificationModelsProps {
  models: Model[]
  onModelClick: (modelId: string) => void
}

export function VerificationModels({ models, onModelClick }: VerificationModelsProps) {
  const verificationModels = models.filter(model => model.status === 'verification')

  if (verificationModels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-8 text-center">
        <div className="bg-gradient-to-br from-yellow-50 to-orange-100 rounded-full p-6 mb-6">
          <Clock className="w-10 h-10 text-yellow-600" />
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-3">
          No Models Under Verification
        </h3>
        
        <p className="text-gray-600 max-w-md mb-4">
          Models waiting for admin verification will appear here. Upload a model to get started!
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {verificationModels.map((model, index) => (
        <div 
          key={index}
          className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onModelClick(model.id)}
        >
          {/* Model Image */}
          <div className="rounded-[4px] h-[160px] bg-gray-400 relative">
            <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium">
              Under Review
            </div>
            <div className="absolute inset-0 bg-yellow-100/20 flex items-center justify-center">
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          
          {/* Model Info */}
          <div className="p-4">
            <h3 className="font-semibold">{model.title}</h3>
            <p className="text-gray-600 text-sm mt-1">{model.category}</p>
            <p className="text-gray-500 text-xs mt-1">Submitted {model.createdAt}</p>
            
            {/* Verification Status */}
            <div className="flex items-center gap-2 mt-3 text-sm text-yellow-600">
              <Eye className="w-4 h-4" />
              <span>Awaiting Admin Review</span>
            </div>
            
            <div className="mt-2 text-xs text-gray-500">
              Review usually takes 1-3 business days
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}