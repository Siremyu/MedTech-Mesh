// components/profile/tabs/components/model-status-sections.tsx
import React from 'react'
import { Clock, CheckCircle, XCircle } from 'lucide-react'
import { ModelCard } from './model-card'
import { RejectedModelCard } from './rejected-model-card'
import { EmptyPublishedModels, EmptyVerificationModels, EmptyRejectedModels } from './empty-states'

interface Model {
  id: string
  title: string
  description: string
  thumbnailUrl?: string
  likes: number
  downloads: number
  createdAt: string
  status: string
  rejectionReason?: string
  adminNotes?: string
}

interface ModelStatusSectionProps {
  models: Model[]
  onModelClick: (id: string) => void
  onEditModel?: (id: string) => void
  onUploadClick?: () => void
  isOwner: boolean
}

export function PublishedModelsSection({ 
  models, 
  onModelClick, 
  onUploadClick,
  isOwner 
}: ModelStatusSectionProps) {
  const publishedModels = models.filter(model => model.status === 'published')

  if (publishedModels.length === 0) {
    return <EmptyPublishedModels isOwner={isOwner} onUploadClick={onUploadClick} />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-green-600 mb-4">
        <CheckCircle className="w-5 h-5" />
        <h4 className="font-medium">Published Models ({publishedModels.length})</h4>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {publishedModels.map((model) => (
          <ModelCard
            key={model.id}
            model={model}
            onClick={() => onModelClick(model.id)}
            showStatus={false}
          />
        ))}
      </div>
    </div>
  )
}

export function VerificationModelsSection({ 
  models, 
  onModelClick 
}: ModelStatusSectionProps) {
  const verificationModels = models.filter(model => model.status === 'verification')

  if (verificationModels.length === 0) {
    return <EmptyVerificationModels />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-blue-600 mb-4">
        <Clock className="w-5 h-5" />
        <h4 className="font-medium">Pending Verification ({verificationModels.length})</h4>
        <span className="text-sm text-blue-500">
          Usually reviewed within 24-48 hours
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {verificationModels.map((model) => (
          <ModelCard
            key={model.id}
            model={model}
            onClick={() => onModelClick(model.id)}
            showStatus={true}
          />
        ))}
      </div>
    </div>
  )
}

export function RejectedModelsSection({ 
  models, 
  onModelClick, 
  onEditModel 
}: ModelStatusSectionProps) {
  const rejectedModels = models.filter(model => model.status === 'rejected')

  if (rejectedModels.length === 0) {
    return <EmptyRejectedModels />
  }

  return (
    <div className="space-y-4">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2 text-red-600 mb-2">
          <XCircle className="w-5 h-5" />
          <h4 className="font-medium">Rejected Models ({rejectedModels.length})</h4>
        </div>
        <p className="text-sm text-red-700">
          These models didn't meet our community guidelines. Review the feedback and resubmit after making improvements.
        </p>
      </div>
      
      <div className="space-y-4">
        {rejectedModels.map((model) => (
          <RejectedModelCard
            key={model.id}
            model={model}
            onClick={() => onModelClick(model.id)}
            onEdit={() => onEditModel?.(model.id)}
          />
        ))}
      </div>
    </div>
  )
}