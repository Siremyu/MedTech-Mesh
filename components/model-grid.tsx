'use client'

import * as React from "react"
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@/lib/store'
import { updateModelLikes, updateModelDownloads } from '@/lib/features/models/modelsSlice'
import { ModelCard } from "./model-card"
import { toast } from "sonner"
import { handleModelAction } from '@/lib/api-client/models-feed'
import { useSession } from 'next-auth/react'

// Interface sesuai dengan data dari API Anda
interface Model {
  id: string
  title: string
  author: {
    id: string
    name: string
    username: string
    avatarUrl: string | null
  }
  downloads: number
  likes: number
  views: number
  thumbnailUrl?: string
  coverImageUrl?: string
  category?: string
  createdAt?: string
}

interface ModelGridProps {
  title: string
  models: Model[]
  onModelClick?: (model: Model) => void
  loading?: boolean
}

export function ModelGrid({ title, models, onModelClick, loading = false }: ModelGridProps) {
  const dispatch = useDispatch<AppDispatch>()
  const { data: session } = useSession()
  const [actionLoading, setActionLoading] = React.useState<string | null>(null)

  const handleModelClick = (model: Model) => {
    // Tidak update downloads di sini, biarkan API yang handle
    onModelClick?.(model)
    console.log('🎯 Model clicked:', model.title)
  }

  const handleLike = async (model: Model) => {
    if (!session) {
      toast.error('Please login to like models')
      return
    }

    if (actionLoading === model.id) return

    try {
      setActionLoading(model.id)
      
      // Call API untuk like/unlike
      const response = await handleModelAction(model.id, 'like', { source: 'model_grid' })
      
      if (response.success) {
        // Update Redux store dengan data dari API
        dispatch(updateModelLikes({ 
          id: model.id, 
          likes: response.data.newLikesCount 
        }))
        
        toast.success(response.data.message || 'Model liked!')
        console.log('❤️ Model liked:', model.id, 'New count:', response.data.newLikesCount)
      } else {
        toast.error(response.message || 'Failed to like model')
      }
      
    } catch (error: any) {
      console.error('Failed to like model:', error)
      toast.error(error.message || 'Failed to like model')
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <section className="px-[52px]">
        <h2 className="text-[32px] font-medium mb-8">{title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <ModelCardSkeleton key={`skeleton-${title}-${i}`} />
          ))}
        </div>
      </section>
    )
  }

  if (!models || models.length === 0) {
    return (
      <section className="px-[52px]">
        <h2 className="text-[32px] font-medium mb-8">{title}</h2>
        <div className="text-center py-8">
          <p className="text-muted-foreground">No models found</p>
        </div>
      </section>
    )
  }

  return (
    <section className="px-[52px]">
      <h2 className="text-[32px] font-medium mb-8">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {models.map((model) => (
          <ModelCard
            key={model.id}
            title={model.title}
            author={model.author?.name || model.author?.username || 'Unknown Author'}
            downloads={model.downloads}
            likes={model.likes}
            imageUrl={model.thumbnailUrl || model.coverImageUrl}
            onClick={() => handleModelClick(model)}
            onLike={() => handleLike(model)}
            isLiking={actionLoading === model.id}
          />
        ))}
      </div>
    </section>
  )
}

// Loading skeleton component
function ModelCardSkeleton() {
  return (
    <div className="w-[300px] animate-pulse">
      <div className="w-full aspect-[300/225] bg-gray-300 rounded-[4px] mb-4"></div>
      <div className="flex items-start gap-3">
        <div className="h-[45px] w-[45px] rounded-full bg-gray-300 flex-shrink-0"></div>
        <div className="flex-1">
          <div className="h-5 bg-gray-300 rounded mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-2/3 mb-2"></div>
          <div className="flex gap-4">
            <div className="h-4 bg-gray-300 rounded w-16"></div>
            <div className="h-4 bg-gray-300 rounded w-16"></div>
          </div>
        </div>
      </div>
    </div>
  )
}