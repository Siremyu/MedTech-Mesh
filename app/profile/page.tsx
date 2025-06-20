// app/profile/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { User } from '@/types'
import { ProfileHeader } from '@/components/profile/profile-header'
import { ProfileTabs } from '@/components/profile/profile-tabs'

// Import all tab components (hapus duplikasi)
import { HomeTab } from '@/components/profile/tabs/home-tab'
import { CollectionsTab } from '@/components/profile/tabs/collections-tab'
import { ModelsTab } from '@/components/profile/tabs/models-tab'

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('home')
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') {
      // Session is loading, don't do anything yet
      return
    }

    if (status === 'unauthenticated') {
      // User is not logged in, redirect to login page
      router.push('/?login=true')
    } else if (session?.user) {
      // User is logged in, set the user state
      setUser(session.user)
      setLoading(false)
    }
  }, [session, status, router])

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
  }

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

  if (!loading && !user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[400px] pt-[80px]">
          <div className="text-center max-w-md mx-auto p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
            <p className="text-gray-600 mb-4">
              The requested user profile could not be found. The user may have deleted their account or the URL may be incorrect.
            </p>
            <div className="space-y-2">
              <Button onClick={() => router.push('/')}>Go Home</Button>
              <Button variant="outline" onClick={() => router.push('/?login=true')}>
                Login
              </Button>
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