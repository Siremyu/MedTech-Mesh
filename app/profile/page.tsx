// app/profile/page.tsx
'use client'

import { AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Avatar } from '@radix-ui/react-avatar'
import { Button } from '@/components/ui/button'
import React, { useEffect, useState } from 'react'
import { BiLike } from 'react-icons/bi';
import { MdOutlineFileDownload } from 'react-icons/md';
import { Navbar } from '@/components/navbar';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSelector } from 'react-redux'
import { RootState } from '@/lib/store'
import { ProfileSkeleton } from '@/components/skeletons/profile-skeleton'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'

// Import shared types
import { UserProfile, ProfileModel, ProfileTabType } from '@/types/profile'

// Import all tab components
import { HomeTab } from '@/components/profile/tabs/home-tab';
import { CollectionsTab } from '@/components/profile/tabs/collections-tab';
import { ModelsTab } from '@/components/profile/tabs/models-tab';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<ProfileTabType>('3d-models');
  const [sortBy, setSortBy] = useState('recent');
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [userModels, setUserModels] = useState<ProfileModel[]>([])
  const [isOwner, setIsOwner] = useState(false)
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useSelector((state: RootState) => state.auth)
  const { data: session, status } = useSession()

  // Get userId from URL params, fallback to session user
  const requestedUserId = searchParams.get('userId')
  const profileUserId = requestedUserId || session?.user?.id

  console.log('🎯 Profile Page Debug:')
  console.log('Component rendered at:', new Date().toISOString())
  console.log('Requested User ID:', requestedUserId)
  console.log('Session User ID:', session?.user?.id)
  console.log('Final Profile User ID:', profileUserId)
  console.log('Session Status:', status)
  console.log('Session:', session)
  console.log('Redux User:', user)

  useEffect(() => {
    // Wait for session to be loaded if we're viewing own profile
    if (status === 'loading') {
      console.log('⏳ Session still loading...')
      return
    }

    if (profileUserId) {
      fetchProfileData()
      loadUserModels()
    } else if (!requestedUserId) {
      // No specific user requested and no session - redirect to login
      console.log('❌ No user ID and no session - need login')
      setLoading(false)
    } else {
      setLoading(false)
    }
  }, [profileUserId, status])

  const fetchProfileData = async () => {
    console.log('🔍 Frontend: Starting profile fetch...')
    console.log('📝 Profile User ID:', profileUserId)
    
    try {
      setLoading(true)
      
      const apiUrl = `/api/profile?userId=${profileUserId}`
      
      console.log('📡 Frontend: Fetching from:', apiUrl)
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      })
      
      console.log('📡 Frontend: Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Frontend: Profile data received:', data)
        
        if (data.success && data.profile) {
          setProfile(data.profile)
          setIsOwner(data.isOwner)
          
          // Update Redux state if this is the current user
          if (data.isOwner && data.profile) {
            console.log('🔄 Updating Redux state with profile data')
            // You might want to dispatch an action here to update Redux state
          }
          
          console.log('✅ Profile state updated successfully')
        } else {
          throw new Error(data.error || 'Invalid response format')
        }
      } else {
        const errorData = await response.json()
        console.error('❌ Frontend: API error:', errorData)
        
        if (response.status === 404) {
          if (errorData.debugInfo) {
            console.log('🔍 Debug info:', errorData.debugInfo)
            
            if (errorData.debugInfo.totalUsersInDb === 0) {
              toast.error('Database appears to be empty. Please create an account first.')
            } else if (errorData.debugInfo.sessionUserId !== errorData.debugInfo.requestedUserId) {
              toast.error('User profile not found. The user may have deleted their account.')
            } else {
              toast.error('Profile sync issue detected. Please try logging out and back in.')
            }
          } else {
            toast.error('User profile not found.')
          }
        } else if (response.status === 401) {
          toast.error('Please login to view this profile')
          router.push('/?login=true')
        } else {
          toast.error(errorData.error || 'Failed to load profile')
        }
        
        setProfile(null)
        setIsOwner(false)
      }
    } catch (error: any) {
      console.error('❌ Profile fetch failed:', error)
      toast.error(error.message || 'Failed to load profile')
      setProfile(null)
      setIsOwner(false)
    } finally {
      setLoading(false)
    }
  }

  const loadUserModels = async () => {
    if (!profileUserId) return
    
    console.log('🔍 Loading user models...')
    try {
      const response = await fetch(
        `/api/profile/models?userId=${profileUserId}&sortBy=${sortBy}&limit=20`,
        { credentials: 'include' }
      )

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Models loaded:', data.models?.length || 0)
        
        const processedModels: ProfileModel[] = (data.models || [])
          .filter((model: any) => ['published', 'verification', 'rejected'].includes(model.status))
          .map((model: any): ProfileModel => ({
            id: model.id,
            title: model.title,
            description: model.description || 'No description available',
            category: model.category,
            tags: model.tags,
            thumbnailUrl: model.thumbnailUrl,
            likes: model.likes || 0,
            downloads: model.downloads || 0,
            views: model.views || 0,
            status: model.status,
            createdAt: model.createdAt,
            publishedAt: model.publishedAt,
            rejectionReason: model.rejectionReason,
            adminNotes: model.adminNotes
          }))
        
        setUserModels(processedModels)
      } else {
        console.error('❌ Failed to load models:', response.status)
        setUserModels([])
      }
    } catch (error) {
      console.error('❌ Models fetch failed:', error)
      setUserModels([])
    }
  }

  const handleModelClick = (modelId: string) => {
    console.log('🔗 Model clicked:', modelId)
    router.push(`/product?id=${modelId}`);
  };

  // Tab definitions
  const tabs = [
    { id: 'home', label: 'Home' },
    { id: 'collections', label: 'Collections' },
    { id: '3d-models', label: '3d Models' },
    { id: 'laser-cut', label: 'Laser & Cut Models' },
    { id: 'posts', label: 'Posts' },
    { id: 'ratings', label: 'Ratings' },
  ] as const;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="mt-[92px]">
          <ProfileSkeleton />
        </div>
      </div>
    )
  }

  if (!loading && !profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[400px] pt-[80px]">
          <div className="text-center max-w-md mx-auto p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
            <p className="text-gray-600 mb-4">
              {requestedUserId 
                ? 'The requested user profile could not be found. The user may have deleted their account or the URL may be incorrect.' 
                : status === 'unauthenticated' 
                  ? 'Please login to view your profile.' 
                  : 'Your profile could not be loaded. Please try refreshing the page.'}
            </p>
            <div className="space-y-2">
              <Button onClick={() => router.push('/')}>Go Home</Button>
              {status === 'unauthenticated' && (
                <Button variant="outline" onClick={() => router.push('/?login=true')}>
                  Login
                </Button>
              )}
              {status === 'authenticated' && !requestedUserId && (
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Refresh Page
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen min-w-screen">
      <Navbar/>
      <div className='flex flex-col h-screen'>
        {/* Cover Image */}
        <img className='w-full h-[230px]' src="/path/to/placeholder.jpg" alt="" />
        <div className='flex'>
          {/* Left Sidebar */}
          <div className='px-[52px] w-[424px] border-r-1 h-screen'>
            <div className='border-b-1 pb-[18px]'>
              <Avatar className='relative top-[-62px]'>
                {/* Avatar Image */}
                {profile?.avatarUrl && (
                  <AvatarImage 
                    src={profile.avatarUrl} 
                    alt={`${profile.displayName}'s avatar`}
                    className='size-[124px] outline-1 object-cover'
                  />
                )}
                <AvatarFallback className='size-[124px] outline-1 bg-gray-200 text-gray-700 text-2xl font-semibold'>
                  {profile?.displayName?.slice(0, 2).toUpperCase() || 'CN'}
                </AvatarFallback>
              </Avatar>
              <div className='gap-[12px] mt-[32px]'>
                <h1 className='text-[24px] font-semibold'>
                  {profile?.displayName || 'Loading...'}
                </h1>
                <p className='text-[14px] text-muted-foreground'>
                  @{profile?.username || 'loading'}
                </p>
                {isOwner && (
                  <p className='text-[12px] text-blue-600 mt-1'>Your Profile</p>
                )}
                {profile?.bio && (
                  <p className='text-[14px] text-gray-600 mt-2'>
                    {profile.bio}
                  </p>
                )}
              </div>
            </div>
            
            {/* Stats section */}
            <div className='flex gap-[18px] mt-[12px]'>
              <p className='text-[14px] text-muted-foreground flex items-center gap-1'>
                <BiLike className="size-[20px]"/>
                {profile?.stats.totalLikes || 0} like
              </p>
              <p className='text-[14px] text-muted-foreground flex items-center gap-1'>
                <MdOutlineFileDownload className="size-[20px]"/>
                {profile?.stats.totalDownloads || 0} download
              </p>
            </div>
            
            {/* Additional stats */}
            {profile?.stats && (
              <div className='flex gap-[18px] mt-[8px]'>
                <p className='text-[12px] text-gray-500'>
                  {profile.stats.totalModels} models
                </p>
                <p className='text-[12px] text-gray-500'>
                  {profile.stats.followers} followers
                </p>
                <p className='text-[12px] text-gray-500'>
                  {profile.stats.following} following
                </p>
              </div>
            )}
          </div>
          
          {/* Right content area */}
          <div className='flex-1 px-[32px] py-[24px]'>
            {/* Navigation tabs */}
            <div className='flex gap-[24px] mb-[32px]'>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`px-[16px] py-[12px] text-[16px] font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Dynamic Tab Content */}
            {activeTab === 'home' && (
              <HomeTab 
                isOwner={isOwner} 
                models={userModels} 
                onModelClick={handleModelClick}
                sortBy={sortBy}
                onSortChange={setSortBy}
              />
            )}
            {activeTab === 'collections' && (
              <CollectionsTab isOwner={isOwner} />
            )}
            {activeTab === '3d-models' && (
              <ModelsTab 
                models={userModels} 
                isOwner={isOwner} 
                onModelClick={handleModelClick}
                sortBy={sortBy}
                onSortChange={setSortBy}
              />
            )}
            {/* Add other tab components as needed */}
          </div>
        </div>
      </div>
    </div>
  )
}