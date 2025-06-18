import { Skeleton } from "@/components/ui/skeleton"

export function ModelCardSkeleton() {
  return (
    <div className="group w-[300px]">
      {/* Model Preview Skeleton */}
      <Skeleton className="w-full aspect-[300/225] rounded-[4px] mb-4" />
      
      {/* Model Info Skeleton */}
      <div className="flex items-start gap-3">
        {/* Author Avatar Skeleton */}
        <Skeleton className="h-[45px] w-[45px] rounded-full flex-shrink-0" />
        
        {/* Content Skeleton */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Title Skeleton */}
          <Skeleton className="h-[24px] w-full" />
          
          {/* Author Skeleton */}
          <Skeleton className="h-[19px] w-[80px]" />
          
          {/* Stats Skeleton */}
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-[6px]">
              <Skeleton className="h-[18px] w-[18px]" />
              <Skeleton className="h-[17px] w-[30px]" />
            </div>
            <div className="flex items-center gap-[6px]">
              <Skeleton className="h-[18px] w-[18px]" />
              <Skeleton className="h-[17px] w-[30px]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}