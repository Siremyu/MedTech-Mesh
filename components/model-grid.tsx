import * as React from "react"
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@/lib/store'
import { updateModelLikes, updateModelDownloads } from '@/lib/features/models/modelsSlice'
import { ModelCard } from "./model-card"

interface Model {
  id: string
  title: string
  author: string
  downloads: number
  likes: number
  imageUrl?: string
}

interface ModelGridProps {
  title: string
  models: Model[]
  onModelClick?: (model: Model) => void
}

export function ModelGrid({ title, models, onModelClick }: ModelGridProps) {
  const dispatch = useDispatch<AppDispatch>()

  const handleModelClick = (model: Model) => {
    // Update downloads count when model is clicked
    dispatch(updateModelDownloads({ 
      id: model.id, 
      downloads: model.downloads + 1 
    }))
    
    onModelClick?.(model)
  }

  const handleLike = (modelId: string, currentLikes: number) => {
    dispatch(updateModelLikes({ 
      id: modelId, 
      likes: currentLikes + 1 
    }))
  }

  return (
    <section className="px-[52px]">
      <h2 className="text-[32px] font-medium mb-8">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {models.map((model) => (
          <ModelCard
            key={model.id}
            title={model.title}
            author={model.author}
            downloads={model.downloads}
            likes={model.likes}
            imageUrl={model.imageUrl}
            onClick={() => handleModelClick(model)}
            onLike={() => handleLike(model.id, model.likes)}
          />
        ))}
      </div>
    </section>
  )
}