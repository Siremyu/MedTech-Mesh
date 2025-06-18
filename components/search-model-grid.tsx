import * as React from "react"
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/lib/store'
import { addSearchResults, updateModelLikes, updateModelDownloads, setSearchLoading } from '@/lib/features/models/modelsSlice'
import { ModelCard } from "./model-card"
import { ModelCardSkeleton } from "./skeletons/model-card-skeleton"
import { Search } from "lucide-react"

interface Model {
  id: string
  title: string
  author: string
  downloads: number
  likes: number
  imageUrl?: string
}

interface SearchModelGridProps {
  onModelClick?: (model: Model) => void
}

export function SearchModelGrid({ onModelClick }: SearchModelGridProps) {
  const dispatch = useDispatch<AppDispatch>()
  const { 
    searchResults, 
    searchQuery, 
    searchLoading, 
    searchHasMore, 
    searchPage 
  } = useSelector((state: RootState) => state.models)
  const [isLoadingMore, setIsLoadingMore] = React.useState(false)
  const observerRef = React.useRef<HTMLDivElement>(null)

  // Generate search results based on query with unique IDs
  const generateSearchResults = (query: string, page: number) => {
    const searchTerms = ['heart', 'lung', 'brain', 'anatomy', 'medical', 'organ', 'skeleton', 'muscle']
    const categories = ['Cardiology', 'Neurology', 'Orthopedics', 'General', 'Surgery']
    
    return Array.from({ length: 8 }, (_, i) => ({
      id: `search-${query}-page-${page}-item-${i}-${Date.now()}`, // Make IDs more unique
      title: `${query} Model ${page}-${i + 1}`,
      author: `${categories[i % categories.length]} Author`,
      downloads: Math.floor(Math.random() * 800) + 200,
      likes: Math.floor(Math.random() * 400) + 100,
      category: categories[i % categories.length],
    }))
  }

  const loadMoreSearchResults = React.useCallback(async () => {
    if (isLoadingMore || !searchHasMore || !searchQuery) return

    setIsLoadingMore(true)
    dispatch(setSearchLoading(true))

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const newResults = generateSearchResults(searchQuery, searchPage + 1)
      
      // Add new search results to existing ones
      dispatch(addSearchResults(newResults))
    } catch (error) {
      console.error('Failed to load more search results:', error)
    } finally {
      setIsLoadingMore(false)
      dispatch(setSearchLoading(false))
    }
  }, [dispatch, isLoadingMore, searchHasMore, searchQuery, searchPage])

  // Intersection Observer for infinite scroll
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0]
        if (target.isIntersecting && !isLoadingMore && searchHasMore) {
          loadMoreSearchResults()
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px',
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
  }, [loadMoreSearchResults, isLoadingMore, searchHasMore])

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

  if (searchResults.length === 0 && !searchLoading) {
    return (
      <section className="px-[52px] py-12">
        <div className="text-center">
          <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-medium mb-2">No results found</h2>
          <p className="text-muted-foreground">
            No models found for "{searchQuery}". Try a different search term.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="px-[52px]">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-[32px] font-medium">
          Search Results for "{searchQuery}" ({searchResults.length} results)
        </h2>
        
        {/* Sort options */}
        <select className="px-3 py-2 border rounded-lg bg-background">
          <option value="relevance">Most Relevant</option>
          <option value="recent">Most Recent</option>
          <option value="popular">Most Popular</option>
          <option value="downloads">Most Downloaded</option>
        </select>
      </div>
      
      {/* Search Results Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {searchResults.map((model) => (
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
        {searchLoading && (
          <>
            {Array.from({ length: 8 }).map((_, index) => (
              <ModelCardSkeleton key={`search-skeleton-${searchQuery}-${searchPage}-${index}-${Date.now()}`} />
            ))}
          </>
        )}
      </div>

      {/* Intersection observer target */}
      <div ref={observerRef} className="h-4 mt-8" />

      {/* Load more button (fallback for manual loading) */}
      {!searchLoading && searchHasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={loadMoreSearchResults}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            disabled={isLoadingMore}
          >
            {isLoadingMore ? 'Loading...' : 'Load More Results'}
          </button>
        </div>
      )}

      {/* End of results message */}
      {!searchHasMore && searchResults.length > 0 && (
        <div className="text-center mt-8 py-4 text-muted-foreground">
          <p>You've reached the end of search results!</p>
        </div>
      )}
    </section>
  )
}