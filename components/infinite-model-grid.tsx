import * as React from "react"
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/lib/store'
import { addOtherModels, updateModelLikes, updateModelDownloads, setOtherModelsLoading } from '@/lib/features/models/modelsSlice'
import { ModelCard } from "./model-card"
import { ModelCardSkeleton } from "./skeletons/model-card-skeleton"

interface Model {
  id: string
  title: string
  author: string
  downloads: number
  likes: number
  imageUrl?: string
}

interface InfiniteModelGridProps {
  title: string
  onModelClick?: (model: Model) => void
}

export function InfiniteModelGrid({ title, onModelClick }: InfiniteModelGridProps) {
  const dispatch = useDispatch<AppDispatch>()
  const { otherModels, otherModelsLoading, otherModelsHasMore, otherModelsPage } = useSelector((state: RootState) => state.models)
  const [isLoadingMore, setIsLoadingMore] = React.useState(false)
  const observerRef = React.useRef<HTMLDivElement>(null)

  // Generate sample data for pagination with unique IDs
  const generateMoreModels = (page: number) => {
    const timestamp = Date.now()
    return Array.from({ length: 8 }, (_, i) => ({
      id: `other-page-${page}-item-${i}-${timestamp}`, // More unique ID pattern
      title: `Other Model ${page}-${i + 1}`,
      author: `Author ${page}`,
      downloads: Math.floor(Math.random() * 500) + 100,
      likes: Math.floor(Math.random() * 300) + 50,
    }))
  }

  const loadMoreModels = React.useCallback(async () => {
    if (isLoadingMore || !otherModelsHasMore) return

    setIsLoadingMore(true)
    dispatch(setOtherModelsLoading(true))

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const newModels = generateMoreModels(otherModelsPage + 1)
      
      // Add new models to existing ones
      dispatch(addOtherModels(newModels))
    } catch (error) {
      console.error('Failed to load more models:', error)
    } finally {
      setIsLoadingMore(false)
      dispatch(setOtherModelsLoading(false))
    }
  }, [dispatch, isLoadingMore, otherModelsHasMore, otherModelsPage])

  // Intersection Observer for infinite scroll
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0]
        if (target.isIntersecting && !isLoadingMore && otherModelsHasMore) {
          loadMoreModels()
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px', // Load when 100px before reaching the bottom
      }
    )

    if (observerRef.current) {
      observer.observe(observerRef.current)
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current)
      }
    }
  }, [loadMoreModels, isLoadingMore, otherModelsHasMore])

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
      
      {/* Models Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {otherModels.map((model) => (
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
        
        {/* Loading skeletons while fetching more */}
        {otherModelsLoading && (
          <>
            {Array.from({ length: 8 }).map((_, index) => (
              <ModelCardSkeleton key={`infinite-skeleton-${otherModelsPage}-${index}-${Date.now()}`} />
            ))}
          </>
        )}
      </div>

      {/* Intersection observer target */}
      <div ref={observerRef} className="h-4 mt-8" />

      {/* Load more button (fallback for manual loading) */}
      {!otherModelsLoading && otherModelsHasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={loadMoreModels}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            disabled={isLoadingMore}
          >
            {isLoadingMore ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}

      {/* End of results message */}
      {!otherModelsHasMore && otherModels.length > 0 && (
        <div className="text-center mt-8 py-4 text-muted-foreground">
          <p>You've reached the end of the models!</p>
        </div>
      )}
    </section>
  )
}