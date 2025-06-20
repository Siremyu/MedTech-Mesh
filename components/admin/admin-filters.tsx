'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RefreshCw, Filter } from 'lucide-react'

interface AdminFiltersProps {
  filter: 'all' | 'verification' | 'published' | 'rejected'
  sortBy: 'newest' | 'oldest' | 'category'
  onFilterChange: (filter: 'all' | 'verification' | 'published' | 'rejected') => void
  onSortChange: (sortBy: 'newest' | 'oldest' | 'category') => void
  onRefresh: () => void
}

/**
 * Admin Filters Component - /components/admin/admin-filters.tsx
 * Provides filtering and sorting controls for admin dashboard
 */
export function AdminFilters({ 
  filter, 
  sortBy, 
  onFilterChange, 
  onSortChange, 
  onRefresh 
}: AdminFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg">
      {/* Left side - Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filters:</span>
        </div>
        
        {/* Status Filter */}
        <Select value={filter} onValueChange={onFilterChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Models</SelectItem>
            <SelectItem value="verification">Pending Review</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort By */}
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="category">Category</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Right side - Actions */}
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefresh}
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>
    </div>
  )
}