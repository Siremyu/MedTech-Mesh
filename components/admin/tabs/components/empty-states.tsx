// components/profile/tabs/components/empty-states.tsx
import React from 'react'
import { Upload, FolderOpen, Clock, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  actionButton?: React.ReactNode
}

function EmptyState({ icon, title, description, actionButton }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <div className="bg-gray-100 rounded-full p-4 inline-block mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        {description}
      </p>
      {actionButton}
    </div>
  )
}

interface EmptyPublishedModelsProps {
  isOwner: boolean
  onUploadClick?: () => void
}

export function EmptyPublishedModels({ isOwner, onUploadClick }: EmptyPublishedModelsProps) {
  return (
    <EmptyState
      icon={<Upload className="w-8 h-8 text-gray-600" />}
      title="No Published Models"
      description={
        isOwner 
          ? "Start building your collection by uploading your first 3D model. Share your designs with the MedMesh community!"
          : "This user hasn't published any 3D models yet."
      }
      actionButton={
        isOwner && onUploadClick ? (
          <Button 
            onClick={onUploadClick}
            className="bg-gray-800 hover:bg-gray-700 text-white"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Your First Model
          </Button>
        ) : undefined
      }
    />
  )
}

export function EmptyVerificationModels() {
  return (
    <EmptyState
      icon={<Clock className="w-8 h-8 text-blue-600" />}
      title="No Models in Verification"
      description="Models you upload will appear here while they're being reviewed by our team."
    />
  )
}

export function EmptyRejectedModels() {
  return (
    <EmptyState
      icon={<XCircle className="w-8 h-8 text-red-600" />}
      title="No Rejected Models"
      description="Models that don't meet our guidelines will appear here with feedback for improvement."
    />
  )
}

export function EmptyCollections() {
  return (
    <EmptyState
      icon={<FolderOpen className="w-8 h-8 text-gray-600" />}
      title="No Collections Yet"
      description="Create collections to organize your models and make them easier to discover."
    />
  )
}