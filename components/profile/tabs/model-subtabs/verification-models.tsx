// components/profile/tabs/model-subtabs/verification-models.tsx
"use client"

import { Upload, Download, Heart, Clock } from "lucide-react"

interface Model {
  id: string
  title: string
  description?: string
  category: string
  likes: number
  downloads: number
  views: number
  status: string
  createdAt: string | Date
  publishedAt?: string | Date | null
  rejectionReason?: string
  adminNotes?: string
}

interface VerificationModelsProps {
  models?: Model[]
  onModelClick?: (modelId: string) => void
}

// Helper function to safely format date
const formatDate = (dateInput: string | Date): string => {
  try {
    if (typeof dateInput === 'string') {
      if (dateInput.includes('ago') || dateInput.includes('weeks') || dateInput.includes('days')) {
        return dateInput
      }
      const date = new Date(dateInput)
      if (isNaN(date.getTime())) {
        return dateInput
      }
      return date.toLocaleDateString()
    }
    
    if (dateInput instanceof Date) {
      return dateInput.toLocaleDateString()
    }
    
    return 'Unknown date'
  } catch (error) {
    console.error('Date formatting error:', error)
    return 'Invalid date'
  }
}

export function VerificationModels({ models = [], onModelClick }: VerificationModelsProps) {
  // Filter models to only show those in verification status
  const verificationModels = models.filter(model => model.status === 'verification')

  if (verificationModels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-8 text-center">
        <div className="bg-gradient-to-br from-yellow-50 to-orange-100 rounded-full p-6 mb-6">
          <Clock className="w-10 h-10 text-yellow-600" />
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-3">
          No Models Under Review
        </h3>
        
        <p className="text-gray-600 max-w-md mb-4">
          Models you upload will appear here while being reviewed by our team.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {verificationModels.map((model, index) => (
        <div 
          key={index}
          className="overflow-hidden cursor-pointer"
          onClick={() => onModelClick?.(model.id)}
        >
          {/* Model Image - Same as Published */}
          <div className="rounded-[4px] h-[160px] bg-gray-400 relative">
            <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium">
              Under Review
            </div>
          </div>
          
          {/* Model Info - Same structure as Published */}
          <div className="p-4">
            <h3 className="font-semibold">{model.title}</h3>
            <p className="text-gray-600 text-sm mt-1">{model.category}</p>
            <p className="text-gray-500 text-xs mt-1">
              Submitted {formatDate(model.createdAt)}
            </p>
            
            {/* Stats - Same as Published */}
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