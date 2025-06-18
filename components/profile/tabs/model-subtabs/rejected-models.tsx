'use client'

import React from 'react'
import { X, Edit3, AlertCircle, Upload } from 'lucide-react'
import { Model } from '@/types/model'
import { Button } from '@/components/ui/button'

interface RejectedModelsProps {
  models: Model[]
  onModelClick: (modelId: string) => void
  onEditModel: (modelId: string) => void
}

export function RejectedModels({ models, onModelClick, onEditModel }: RejectedModelsProps) {
  const rejectedModels = models.filter(model => model.status === 'rejected')

  if (rejectedModels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-8 text-center">
        <div className="bg-gradient-to-br from-green-50 to-blue-100 rounded-full p-6 mb-6">
          <Upload className="w-10 h-10 text-green-600" />
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-3">
          No Rejected Models
        </h3>
        
        <p className="text-gray-600 max-w-md mb-4">
          Great! You don't have any rejected models. Keep up the good work!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {rejectedModels.map((model, index) => (
        <div key={index} className="border border-red-200 rounded-lg p-6 bg-red-50/30">
          <div className="flex gap-4">
            {/* Model Thumbnail */}
            <div className="w-32 h-24 bg-gray-400 rounded-[4px] flex-shrink-0 relative">
              <div className="absolute top-1 right-1 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                Rejected
              </div>
            </div>
            
            {/* Model Info */}
            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-lg">{model.title}</h3>
                  <p className="text-gray-600 text-sm">{model.category}</p>
                  <p className="text-gray-500 text-xs mt-1">Rejected {model.createdAt}</p>
                </div>
                
                <Button
                  onClick={() => onEditModel(model.id)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                  size="sm"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit & Resubmit
                </Button>
              </div>
              
              {/* Rejection Reason */}
              <div className="bg-white border border-red-200 rounded-lg p-4 mt-3">
                <div className="flex items-start gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-800 mb-1">Rejection Reason</h4>
                    <p className="text-red-700 text-sm mb-2">
                      {model.rejectionReason || "The model doesn't meet our quality standards."}
                    </p>
                    
                    {model.adminNotes && (
                      <>
                        <h5 className="font-medium text-red-800 mb-1">Admin Notes:</h5>
                        <p className="text-red-600 text-sm">
                          {model.adminNotes}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onModelClick(model.id)}
                  className="border-gray-300"
                >
                  View Details
                </Button>
                <Button
                  onClick={() => onEditModel(model.id)}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Edit Model
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}