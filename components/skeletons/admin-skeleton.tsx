'use client'

import React from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * Admin Skeleton Component - /components/skeletons/admin-skeleton.tsx
 * Loading skeleton for admin dashboard
 */
export function AdminSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-[32px]">
      {/* Header Skeleton */}
      <div className="mb-8">
        <div className="mb-6">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>
            </Card>
          ))}
        </div>

        {/* Filters Skeleton */}
        <div className="flex gap-4 items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex gap-4 items-center">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-[180px]" />
            <Skeleton className="h-10 w-[150px]" />
          </div>
          <Skeleton className="h-10 w-20" />
        </div>
      </div>

      {/* Models Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="h-full flex flex-col">
            <CardHeader className="pb-3">
              <Skeleton className="aspect-video w-full rounded-lg mb-3" />
              <div className="flex items-center justify-between mb-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-6 w-full" />
            </CardHeader>
            <CardContent className="flex-1 pb-3">
              <div className="space-y-2 mb-4">
                <Skeleton className="h-5 w-20" />
                <div className="flex gap-1">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-14" />
                </div>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-12 w-full mb-4" />
            </CardContent>
            <div className="p-6 pt-3 space-y-2">
              <Skeleton className="h-9 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-9 flex-1" />
                <Skeleton className="h-9 flex-1" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}