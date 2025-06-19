// components/profile/tabs/components/models-header.tsx
import React from 'react'
import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ModelsHeaderProps {
  modelsCount: number
  publishedCount: number
  isOwner: boolean
  sortBy: string
  onSortChange: (value: string) => void
  onUploadClick: () => void
}

export function ModelsHeader({
  modelsCount,
  publishedCount,
  isOwner,
  sortBy,
  onSortChange,
  onUploadClick
}: ModelsHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-[20px] font-semibold">
          3D Models ({isOwner ? modelsCount : publishedCount})
        </h2>
        <p className="text-gray-600 max-w-md mt-1">
          {isOwner 
            ? "Manage your 3D model collection and track their status"
            : `Browse ${publishedCount} published models`
          }
        </p>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="recent">Most Recent</option>
            <option value="popular">Most Popular</option>
            <option value="downloads">Most Downloaded</option>
            <option value="alphabetical">A-Z</option>
          </select>
        </div>

        {/* Upload Button */}
        {isOwner && (
          <Button
            onClick={onUploadClick}
            className="flex items-center gap-2 bg-gray-800 text-white hover:bg-gray-700"
          >
            <Upload className="w-4 h-4" />
            Upload Model
          </Button>
        )}
      </div>
    </div>
  )
}