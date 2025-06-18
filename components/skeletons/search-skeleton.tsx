import { Skeleton } from "@/components/ui/skeleton"
import { ModelCardSkeleton } from "./model-card-skeleton"

interface SearchSkeletonProps {
  count?: number
}

export function SearchSkeleton({ count = 8 }: SearchSkeletonProps) {
  return (
    <section className="px-[52px]">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-8">
        <Skeleton className="h-[40px] w-[400px]" />
        <Skeleton className="h-[40px] w-[150px]" />
      </div>
      
      {/* Grid of skeleton cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: count }).map((_, index) => (
          <ModelCardSkeleton key={`search-skeleton-${index}`} />
        ))}
      </div>
    </section>
  )
}