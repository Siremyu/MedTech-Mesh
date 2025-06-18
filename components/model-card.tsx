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
}

export function ModelCard({ 
  title, 
  author, 
  downloads, 
  likes, 
  imageUrl, 
  onClick, 
  onLike 
}: ModelCardProps) {
  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering onClick (navigation)
    onLike?.()
  }

  return (
    <div className="group cursor-pointer w-[300px]" onClick={onClick}>
      {/* Model Preview */}
      <div className="w-full aspect-[300/225] bg-[#C4C4C4] rounded-[4px] overflow-hidden mb-4">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="w-full h-full bg-[#C4C4C4]" />
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
              className="flex items-center gap-[6px] text-[14px] text-muted-foreground cursor-pointer hover:text-red-500 transition-colors"
              onClick={handleLikeClick}
            >
              <Heart className="h-[18px] w-[18px]" />
              <span>{likes}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}