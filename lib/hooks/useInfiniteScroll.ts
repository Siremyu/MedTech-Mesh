import { useState, useEffect, useCallback } from 'react'

interface UseInfiniteScrollOptions {
  hasNextPage: boolean
  fetchNextPage: () => Promise<void>
  threshold?: number
  rootMargin?: string
}

export function useInfiniteScroll({
  hasNextPage,
  fetchNextPage,
  threshold = 0.1,
  rootMargin = '100px'
}: UseInfiniteScrollOptions) {
  const [isFetching, setIsFetching] = useState(false)
  const [observerRef, setObserverRef] = useState<HTMLElement | null>(null)

  const loadMore = useCallback(async () => {
    if (isFetching || !hasNextPage) return

    setIsFetching(true)
    try {
      await fetchNextPage()
    } catch (error) {
      console.error('Failed to fetch next page:', error)
    } finally {
      setIsFetching(false)
    }
  }, [fetchNextPage, hasNextPage, isFetching])

  useEffect(() => {
    if (!observerRef) return

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0]
        if (target.isIntersecting && !isFetching && hasNextPage) {
          loadMore()
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(observerRef)

    return () => {
      observer.unobserve(observerRef)
    }
  }, [observerRef, loadMore, isFetching, hasNextPage, threshold, rootMargin])

  return {
    isFetching,
    setObserverRef,
    loadMore
  }
}