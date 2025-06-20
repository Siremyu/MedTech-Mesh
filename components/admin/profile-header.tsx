'use client'

import { AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Avatar } from '@radix-ui/react-avatar'
import { BiLike } from 'react-icons/bi';
import { MdOutlineFileDownload } from 'react-icons/md';

interface ProfileHeaderProps {
  name: string
  username: string
  likes: number
  downloads: number
  avatarUrl?: string | null
  coverImageUrl?: string | null
}

export function ProfileHeader({ 
  name, 
  username, 
  likes, 
  downloads, 
  avatarUrl, 
  coverImageUrl 
}: ProfileHeaderProps) {
  console.log('🖼️ ProfileHeader - Avatar URL:', avatarUrl)
  
  return (
    <>
      {/* Cover Image */}
      <img 
        className='w-full h-[230px]' 
        src={coverImageUrl || "/path/to/placeholder.jpg"} 
        alt="Profile Cover" 
      />
      
      {/* Left Sidebar */}
      <div className='px-[52px] w-[424px] border-r-1 h-screen'>
        {/* User Information */}
        <div className='border-b-1 pb-[18px]'>
          <Avatar className='relative top-[-62px]'>
            {avatarUrl && (
              <AvatarImage 
                src={avatarUrl} 
                alt={`${name}'s avatar`}
                className='size-[124px] outline-1 object-cover'
              />
            )}
            <AvatarFallback className='size-[124px] outline-1 bg-gray-200 text-gray-700 text-2xl font-semibold'>
              {name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className='gap-[12px] mt-[32px]'>
            <h1 className='text-[24px] font-semibold'>{name}</h1>
            <p className='text-[14px] text-muted-foreground'>@{username}</p>
          </div>
        </div>
        
        {/* User Stats */}
        <div className='flex gap-[18px] mt-[12px]'>
          <p className='text-[14px] text-muted-foreground flex items-center gap-1'>
            <BiLike className="size-[20px]"/>
            {likes} like
          </p>
          <p className='text-[14px] text-muted-foreground flex items-center gap-1'>
            <MdOutlineFileDownload className="size-[20px]"/>
            {downloads} download
          </p>
        </div>
      </div>
    </>
  )
}