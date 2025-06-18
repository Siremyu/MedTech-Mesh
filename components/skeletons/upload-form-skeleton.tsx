import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function UploadFormSkeleton() {
  return (
    <div className="space-y-6">
      {/* File Upload Area Skeleton */}
      <Card className="mb-6 shadow-none">
        <CardContent className="p-6">
          <Skeleton className="border-2 border-dashed rounded-lg p-12 h-[200px]" />
        </CardContent>
      </Card>

      {/* Model Pictures Section Skeleton */}
      <Card className="mb-6 shadow-none">
        <CardHeader>
          <Skeleton className="h-[24px] w-[150px]" />
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Cover image skeleton */}
          <div>
            <Skeleton className="h-[20px] w-[100px] mb-3" />
            <Skeleton className="w-[221px] aspect-[4/3] rounded-lg" />
          </div>
          
          {/* Pictures grid skeleton */}
          <div>
            <Skeleton className="h-[20px] w-[200px] mb-4" />
            <div className="flex gap-[48px] flex-wrap">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="w-[162px] aspect-[1189/669] rounded-lg" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Model Information Section Skeleton */}
      <Card className="mb-6 shadow-none">
        <CardHeader>
          <Skeleton className="h-[24px] w-[180px]" />
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Form fields skeleton */}
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="h-[20px] w-[120px] mb-2" />
              <Skeleton className="h-[40px] w-full" />
            </div>
          ))}
          
          {/* Description textarea skeleton */}
          <div>
            <Skeleton className="h-[20px] w-[100px] mb-2" />
            <Skeleton className="h-[100px] w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}