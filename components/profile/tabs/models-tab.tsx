'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ProfileModel } from '@/types/profile' // Use shared type
import { ModelsHeader } from './components/models-header'
import { SubTabNavigation } from './components/sub-tab-navigation'
import { PublishedModelsSection } from './components/model-status-sections'
import { VerificationModelsSection } from './components/model-status-sections'
import { RejectedModelsSection } from './components/model-status-sections'
import { Model } from '@/types'

interface ModelsTabProps {
  userId: string
}

export function ModelsTab({ userId }: ModelsTabProps) {
  const router = useRouter()
  const [models, setModels] = useState<Model[]>([])
  const [loading, setLoading] = useState(true)
  const [activeSubTab, setActiveSubTab] = useState<string>('published')

  useEffect(() => {
    fetchUserModels()
  }, [userId])

  const fetchUserModels = async () => {
    try {
      const response = await fetch(`/api/profile/models?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setModels(data.models || [])
      }
    } catch (error) {
      console.error('Error fetching models:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate counts for each status
  const statusCounts = useMemo(() => {
    return models.reduce((acc, model) => {
      acc[model.status] = (acc[model.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }, [models])

  const publishedCount = statusCounts.published || 0
  const verificationCount = statusCounts.verification || 0
  const rejectedCount = statusCounts.rejected || 0

  // Sub-tabs configuration
  const subTabs = [
    { id: 'published', label: 'Published', count: publishedCount },
    { id: 'verification', label: 'In Review', count: verificationCount },
    { id: 'rejected', label: 'Rejected', count: rejectedCount }
  ]

  const handleUploadClick = () => {
    router.push('/upload')
  }

  const handleModelClick = (modelId: string) => {
    onModelClick(modelId)
  }

  const handleEditModel = (modelId: string) => {
    router.push(`/edit/${modelId}`)
  }

  const renderSubTabContent = () => {
    switch (activeSubTab) {
      case 'published':
        return (
          <PublishedModelsSection
            models={models}
            onModelClick={handleModelClick}
            onUploadClick={handleUploadClick}
            isOwner={isOwner}
          />
        )
      case 'verification':
        return (
          <VerificationModelsSection
            models={models}
            onModelClick={handleModelClick}
            isOwner={isOwner}
          />
        )
      case 'rejected':
        return (
          <RejectedModelsSection
            models={models}
            onModelClick={handleModelClick}
            onEditModel={handleEditModel}
            isOwner={isOwner}
          />
        )
      default:
        return null
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading models...</div>
  }

  if (models.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No models found</p>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <ModelsHeader
        modelsCount={models.length}
        publishedCount={publishedCount}
        isOwner={isOwner}
        sortBy={sortBy}
        onSortChange={onSortChange}
        onUploadClick={handleUploadClick}
      />

      {/* Sub-tab Navigation */}
      <SubTabNavigation
        subTabs={subTabs}
        activeSubTab={activeSubTab}
        onSubTabChange={setActiveSubTab}
        isOwner={isOwner}
      />

      {/* Content */}
      <div className="min-h-[300px]">
        {renderSubTabContent()}
      </div>
    </div>
  )
}