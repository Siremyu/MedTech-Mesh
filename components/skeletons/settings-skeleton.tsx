import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function SettingsSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Account Information Card Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-[24px] w-[180px]" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Avatar row */}
            <div className="flex items-center justify-between py-4 border-b">
              <div className="flex items-center gap-4">
                <Skeleton className="h-[20px] w-[80px]" />
                <Skeleton className="h-16 w-16 rounded-full" />
              </div>
              <Skeleton className="h-5 w-5" />
            </div>
            
            {/* Other settings rows */}
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between py-4 border-b last:border-b-0">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-[16px] w-[100px]" />
                  <Skeleton className="h-[20px] w-[150px]" />
                </div>
                <Skeleton className="h-5 w-5" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings Card Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-[24px] w-[150px]" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <div>
                  <Skeleton className="h-[16px] w-[200px] mb-1" />
                  <Skeleton className="h-[14px] w-[300px]" />
                </div>
                <Skeleton className="h-6 w-12 rounded-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}