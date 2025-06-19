// components/settings/avatar-upload.tsx
"use client"

import React, { useState, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Camera, Trash2 } from "lucide-react"
import { toast } from "sonner"

interface AvatarUploadProps {
  currentAvatarUrl?: string | null
  displayName: string
  onAvatarUpdate?: (avatarUrl: string | null) => void // Add callback
}

export function AvatarUpload({ 
  currentAvatarUrl, 
  displayName, 
  onAvatarUpdate 
}: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('avatar', file)

      const response = await fetch('/api/profile/avatar', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setAvatarUrl(data.avatarUrl)
        onAvatarUpdate?.(data.avatarUrl) // Notify parent component
        toast.success('Avatar updated successfully')
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to upload avatar')
      }
    } catch (error) {
      console.error('Avatar upload error:', error)
      toast.error('Failed to upload avatar')
    } finally {
      setUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveAvatar = async () => {
    setRemoving(true)
    try {
      const response = await fetch('/api/profile/avatar', {
        method: 'DELETE',
      })

      if (response.ok) {
        setAvatarUrl(null)
        onAvatarUpdate?.(null) // Notify parent component
        toast.success('Avatar removed successfully')
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to remove avatar')
      }
    } catch (error) {
      console.error('Avatar remove error:', error)
      toast.error('Failed to remove avatar')
    } finally {
      setRemoving(false)
    }
  }

  return (
    <div className="flex items-center gap-4 p-4 border rounded-lg">
      <Avatar className="h-16 w-16">
        {avatarUrl && (
          <AvatarImage 
            src={avatarUrl} 
            alt={`${displayName}'s avatar`}
            className="object-cover"
          />
        )}
        <AvatarFallback className="bg-gray-100 text-gray-600 text-lg">
          {displayName.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1">
        <h4 className="font-medium">Profile Picture</h4>
        <p className="text-sm text-gray-600 mb-3">
          Upload a profile picture or use your initials
        </p>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera className="text-white size-[20px]" />
            {uploading ? 'Uploading...' : 'Change Photo'}
          </Button>
          
          {avatarUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRemoveAvatar}
              disabled={removing}
            >
              <Trash2 className="size-[14px] mr-[4px]" />
              {removing ? 'Removing...' : 'Remove'}
            </Button>
          )}
        </div>
        
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  )
}