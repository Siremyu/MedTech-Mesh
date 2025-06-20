'use client'

import * as React from "react"
import { Download, Heart } from "lucide-react"

interface ModelCardProps {
  title: string
  author: string
  downloads: number
  likes: number
  imageUrl?: string
  onClick?: () => void
  onLike?: () => void
  isLiking?: boolean
}

export function ModelCard({ 
  title, 
  author, 
  downloads, 
  likes, 
  imageUrl, 
  onClick, 
  onLike,
  isLiking = false
}: ModelCardProps) {
  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering onClick (navigation)
    if (!isLiking) {
      onLike?.()
    }
  }

  return (
    <div className="group cursor-pointer w-[300px]" onClick={onClick}>
      {/* Model Preview */}
      <div className="w-full aspect-[300/225] bg-[#C4C4C4] rounded-[4px] overflow-hidden mb-4">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
              if (target.parentElement) {
                target.parentElement.innerHTML = '<div class="w-full h-full bg-[#C4C4C4] flex items-center justify-center"><span class="text-gray-500 text-sm">No Preview</span></div>'
              }
            }}
          />
        ) : (
          <div className="w-full h-full bg-[#C4C4C4] flex items-center justify-center">
            <span className="text-gray-500 text-sm">No Preview</span>
          </div>
        )}
      </div>

      {/* Model Info */}
      <div className="flex items-start gap-3">
        {/* Author Avatar */}
        <div className="h-[45px] w-[45px] rounded-full bg-[#C4C4C4] flex-shrink-0" />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-[20px] leading-tight mb-1">{title}</h3>
          <p className="text-[16px] text-muted-foreground mb-2">{author}</p>
          
          {/* Stats */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-[6px] text-[14px] text-muted-foreground">
              <Download className="h-[18px] w-[18px]" />
              <span>{downloads}</span>
            </div>
            <div 
              className={`flex items-center gap-[6px] text-[14px] text-muted-foreground cursor-pointer hover:text-red-500 transition-colors ${
                isLiking ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={handleLikeClick}
            >
              <Heart className={`h-[18px] w-[18px] ${isLiking ? 'animate-pulse' : ''}`} />
              <span>{likes}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}