'use client'

import * as React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Upload, Plus } from "lucide-react"
import { Model } from '@/types/model'

// Import sub-tab components
import { PublishedModels } from './model-subtabs/published-models'
import { VerificationModels } from './model-subtabs/verification-models'
import { RejectedModels } from './model-subtabs/rejected-models'

interface ModelsTabProps {
  models: Model[]
  sortBy: string
  onSortChange: (value: string) => void
  onModelClick?: (modelId: string) => void
  isOwner?: boolean // New prop to check if current user is the profile owner
}

type ModelSubTab = 'published' | 'verification' | 'rejected'

export function ModelsTab({ models, sortBy, onSortChange, onModelClick, isOwner = false }: ModelsTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<ModelSubTab>('published')
  const router = useRouter()

  const handleModelClick = (modelId: string) => {
    if (onModelClick) {
      onModelClick(modelId)
    } else {
      router.push(`/product?id=${modelId}`)
    }
  }

  const handleEditModel = (modelId: string) => {
    router.push(`/edit?id=${modelId}`)
  }

  const handleUploadClick = () => {
    router.push('/upload')
  }

  // Count models by status
  const publishedCount = models.filter(m => m.status === 'published').length
  const verificationCount = models.filter(m => m.status === 'verification').length
  const rejectedCount = models.filter(m => m.status === 'rejected').length

  // For visitors (non-owners), only show published models
  const visitorModels = models.filter(m => m.status === 'published')

  // Show empty state banner if no models at all
  if (!models || models.length === 0 || (!isOwner && visitorModels.length === 0)) {
    return (
      <div>
        {/* Header */}
        <div className="flex justify-between items-center mb-[24px]">
          <h2 className="text-[20px] font-semibold">
            3D Models ({isOwner ? 0 : visitorModels.length})
          </h2>
          {/* Only show upload button if user is the owner */}
          {isOwner && (
            <button 
              onClick={handleUploadClick}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Upload Model
            </button>
          )}
        </div>

        {/* Empty State Banner */}
        <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
          <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-full p-6 mb-6">
            <Upload className="w-12 h-12 text-gray-700" />
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            {isOwner ? "No 3D Models Yet" : "No Published Models"}
          </h3>
          
          <p className="text-gray-600 max-w-md mb-6">
            {isOwner 
              ? "Start building your collection by uploading your first 3D model. Share your designs with the MedMesh community!"
              : "This user hasn't published any 3D models yet."
            }
          </p>
          
          {isOwner && (
            <button 
              onClick={handleUploadClick}
              className="flex items-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              Upload Your First Model
            </button>
          )}
        </div>
      </div>
    )
  }

  // Define sub-tabs based on ownership
  const ownerSubTabs = [
    { 
      id: 'published' as ModelSubTab, 
      label: 'Published', 
      count: publishedCount,
      color: 'text-gray-800'
    },
    { 
      id: 'verification' as ModelSubTab, 
      label: 'Under Review', 
      count: verificationCount,
      color: 'text-gray-600'
    },
    { 
      id: 'rejected' as ModelSubTab, 
      label: 'Rejected', 
      count: rejectedCount,
      color: 'text-gray-500'
    },
  ]

  const visitorSubTabs = [
    { 
      id: 'published' as ModelSubTab, 
      label: 'Published Models', 
      count: publishedCount,
      color: 'text-gray-800'
    }
  ]

  const subTabs = isOwner ? ownerSubTabs : visitorSubTabs

  const renderSubTabContent = () => {
    // For visitors, always show published models regardless of activeSubTab
    if (!isOwner) {
      return <PublishedModels models={models} onModelClick={handleModelClick} />
    }

    // For owners, show content based on active sub-tab
    switch (activeSubTab) {
      case 'published':
        return <PublishedModels models={models} onModelClick={handleModelClick} />
      case 'verification':
        return <VerificationModels models={models} onModelClick={handleModelClick} />
      case 'rejected':
        return <RejectedModels models={models} onModelClick={handleModelClick} onEditModel={handleEditModel} />
      default:
        return null
    }
  }

  return (
    <div>
      {/* Header with title and sort */}
      <div className="flex justify-between items-center mb-[24px]">
        <h2 className="text-[20px] font-semibold">
          3D Models ({isOwner ? models.length : publishedCount})
        </h2>
        <div className="flex items-center gap-4">
          {/* Show sort dropdown for all users */}
          <select 
            className="px-3 py-2 border rounded-lg text-gray-700"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
          >
            <option value="recent">Most Recent</option>
            <option value="popular">Most Popular</option>
            <option value="downloads">Most Downloaded</option>
          </select>
          
          {/* Only show upload button if user is the owner */}
          {isOwner && (
            <button 
              onClick={handleUploadClick}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Upload Model
            </button>
          )}
        </div>
      </div>

      {/* Sub-tabs Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        {subTabs.map((subTab) => (
          <button
            key={subTab.id}
            className={`px-4 py-3 text-sm font-medium transition-colors flex items-center gap-2 ${
              activeSubTab === subTab.id
                ? 'text-black border-b-2 border-gray-800'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveSubTab(subTab.id)}
          >
            <span>{subTab.label}</span>
            {subTab.count > 0 && (
              <span className={`px-2 py-1 rounded-full text-xs ${
                activeSubTab === subTab.id ? 'bg-gray-200 text-gray-800' : 'bg-gray-100 text-gray-600'
              }`}>
                {subTab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Sub-tab Content */}
      <div className="min-h-[300px]">
        {renderSubTabContent()}
      </div>
    </div>
  )
}