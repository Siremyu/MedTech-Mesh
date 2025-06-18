import { Skeleton } from "@/components/ui/skeleton"

export function ProfileSkeleton() {
  return (
    <div className="min-h-screen min-w-screen">
      {/* Background image skeleton */}
      <Skeleton className="w-full h-[230px]" />
      
      <div className="flex">
        {/* Left sidebar skeleton */}
        <div className="px-[52px] w-[424px] border-r-1 h-screen">
          {/* User information skeleton */}
          <div className="border-b-1 pb-[18px]">
            {/* Avatar skeleton */}
            <Skeleton className="size-[124px] rounded-full relative top-[-62px]" />
            
            <div className="gap-[12px] mt-[32px] space-y-2">
              {/* Display name skeleton */}
              <Skeleton className="h-[29px] w-[200px]" />
              {/* Username skeleton */}
              <Skeleton className="h-[17px] w-[120px]" />
            </div>
          </div>
          
          {/* User stats skeleton */}
          <div className="flex gap-[18px] mt-[12px]">
            <div className="flex items-center gap-[6px]">
              <Skeleton className="size-[20px]" />
              <Skeleton className="h-[17px] w-[50px]" />
            </div>
            <div className="flex items-center gap-[6px]">
              <Skeleton className="size-[20px]" />
              <Skeleton className="h-[17px] w-[70px]" />
            </div>
          </div>
        </div>
        
        {/* Right content skeleton */}
        <div className="flex-1 px-[32px] py-[24px]">
          {/* Navigation tabs skeleton */}
          <div className="flex gap-[24px] mb-[32px]">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[40px] w-[80px]" />
            ))}
          </div>
          
          {/* Pinned models section skeleton */}
          <div className="mb-[48px]">
            <Skeleton className="h-[24px] w-[150px] mb-[16px]" />
            <div className="grid grid-cols-3 gap-[16px]">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="w-[200px] h-[200px] rounded-lg" />
                  <Skeleton className="h-[17px] w-[140px]" />
                </div>
              ))}
            </div>
          </div>
          
          {/* Collections section skeleton */}
          <div>
            <Skeleton className="h-[24px] w-[120px] mb-[16px]" />
            <div className="grid grid-cols-3 gap-[16px]">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="w-[200px] h-[200px] rounded-lg" />
                  <Skeleton className="h-[17px] w-[160px]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}