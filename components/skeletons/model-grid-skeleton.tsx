import { Skeleton } from "@/components/ui/skeleton"
import { ModelCardSkeleton } from "./model-card-skeleton"

interface ModelGridSkeletonProps {
  title: string
  count?: number
}

export function ModelGridSkeleton({ title, count = 8 }: ModelGridSkeletonProps) {
  return (
    <section className="px-[52px]">
      {/* Title */}
      <h2 className="text-[32px] font-medium mb-8">{title}</h2>
      
      {/* Grid of skeleton cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: count }).map((_, index) => (
          <ModelCardSkeleton key={index} />
        ))}
      </div>
    </section>
  )
}