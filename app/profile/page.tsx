'use client'

import { AvatarFallback } from '@/components/ui/avatar'
import { Avatar } from '@radix-ui/react-avatar'
import React, { useEffect, useState } from 'react'
import { BiLike } from 'react-icons/bi';
import { MdOutlineFileDownload } from 'react-icons/md';
import { Navbar } from '@/components/navbar';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSelector } from 'react-redux'
import { RootState } from '@/lib/store'
import { ProfileSkeleton } from '@/components/skeletons/profile-skeleton'
import { Plus } from "lucide-react"

// Import all tab components
import { HomeTab } from '@/components/profile/tabs/home-tab';
import { CollectionsTab } from '@/components/profile/tabs/collections-tab';
import { ModelsTab } from '@/components/profile/tabs/models-tab';
import { LaserCutTab } from '@/components/profile/tabs/laser-cut-tab';
import { PostsTab } from '@/components/profile/tabs/posts-tab';
import { RatingsTab } from '@/components/profile/tabs/ratings-tab';
import { Footer } from '@/components/footer';

// Sample data
const sampleModels = [
  {
    id: 'model-1',
    title: "Medical Heart Model",
    category: "Medical",
    likes: 85,
    downloads: 130,
    status: 'published' as const,
    createdAt: '2 weeks ago'
  },
  {
    id: 'model-2', 
    title: "Brain Anatomy",
    category: "Anatomy",
    likes: 92,
    downloads: 156,
    status: 'verification' as const,
    createdAt: '3 days ago'
  },
  {
    id: 'model-3',
    title: "Kidney Model",
    category: "Medical",
    likes: 0,
    downloads: 0,
    status: 'rejected' as const,
    createdAt: '1 week ago',
    rejectionReason: "Model quality doesn't meet standards. Please check mesh integrity.",
    adminNotes: "The model has several holes and non-manifold edges. Please fix these issues and resubmit."
  }
];

type TabType = 'home' | 'collections' | '3d-models' | 'laser-cut' | 'posts' | 'ratings';

interface UserProfile {
  id: string
  displayName: string
  username: string
  avatarUrl?: string
  stats: {
    totalLikes: number
    totalDownloads: number
  }
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<TabType>('3d-models');
  const [sortBy, setSortBy] = useState('recent');
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useSelector((state: RootState) => state.auth)

  // Check if current user is viewing their own profile
  // You can get this from auth state, URL params, or API
  const currentUserId = "current-user-123"; // This should come from auth
  const profileUserId = searchParams.get('userId') || currentUserId; // Default to current user if no userId param
  const isOwner = currentUserId === profileUserId;

  useEffect(() => {
    loadUserProfile()
  }, [])

  const loadUserProfile = async () => {
    try {
      setLoading(true)
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock profile data
      const profileData: UserProfile = {
        id: '1',
        displayName: 'John Doe',
        username: 'johndoe',
        stats: {
          totalLikes: 1250,
          totalDownloads: 890
        }
      }
      
      setProfile(profileData)
    } catch (error) {
      console.error('Failed to load profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleModelClick = (modelId: string) => {
    router.push(`/product?id=${modelId}`);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeTab />;
      case 'collections':
        return <CollectionsTab />;
      case '3d-models':
        return (
          <ModelsTab 
            models={sampleModels}
            sortBy={sortBy}
            onSortChange={handleSortChange}
            onModelClick={handleModelClick}
            isOwner={isOwner} // Pass isOwner prop
          />
        );
      case 'laser-cut':
        return <LaserCutTab />;
      case 'posts':
        return <PostsTab />;
      case 'ratings':
        return <RatingsTab />;
      default:
        return null;
    }
  };

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

  return (
    <div className="min-h-screen min-w-screen">
      <Navbar/>
      <div className='flex flex-col h-screen'>
        {/* placeholder bg */}
        <img className='w-full h-[230px]' src="/path/to/placeholder.jpg" alt="" />
        <div className='flex'>
          {/* div kiri */}
          <div className='px-[52px] w-[424px] border-r-1 h-screen'>
            {/* user information */}
            <div className='border-b-1 pb-[18px]'>
              <Avatar className='relative top-[-62px]'>
                <AvatarFallback className='size-[124px] outline-1'>
                  {profile?.displayName?.slice(0, 2).toUpperCase() || 'CN'}
                </AvatarFallback>
              </Avatar>
              <div className='gap-[12px] mt-[-36px]'>
                <h1 className='text-[24px] font-semibold'>
                  {profile?.displayName || 'Loading...'}
                </h1>
                <p className='text-[14px] text-muted-foreground'>
                  @{profile?.username || 'loading'}
                </p>
                {/* Show ownership indicator */}
                {isOwner && (
                  <p className='text-[12px] text-blue-600 mt-1'>Your Profile</p>
                )}
              </div>
            </div>
            {/* user stats */}
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
          </div>
          
          {/* div kanan */}
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
            <div className="min-h-[400px]">
              {renderTabContent()}
            </div>

            {/* Pinned Models Section */}
            <div className='mb-[48px]'>
              <h2 className='text-[20px] font-semibold mb-[16px]'>Pinned Models</h2>
              <div className='grid grid-cols-3 gap-[16px]'>
                {/* Add new model button */}
                <div className='w-[200px] h-[200px] border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-gray-400 cursor-pointer'>
                  <Plus className='w-[24px] h-[24px] text-gray-400 mb-[8px]' />
                  <span className='text-[14px] text-gray-500'>Add Model</span>
                </div>
              </div>
            </div>

            {/* Collections Section */}
            <div>
              <h2 className='text-[20px] font-semibold mb-[16px]'>Collections</h2>
              <div className='grid grid-cols-3 gap-[16px]'>
                {/* Collections will be loaded here */}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  )
}
