"use client";

import * as React from "react";
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@/lib/store'
import { setLoading } from '@/lib/features/models/modelsSlice'
import { useRouter, useSearchParams } from 'next/navigation'
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { fetchModelsFeed } from '@/lib/api-client/models-feed';
import { BiLike } from 'react-icons/bi';
import { MdOutlineFileDownload } from 'react-icons/md';
import { IoMdShareAlt } from 'react-icons/io';
import { Button } from '@/components/ui/button';
import { Avatar } from '@radix-ui/react-avatar';
import { AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ModelCardSkeleton } from '@/components/skeletons/model-card-skeleton';
import { ModelGrid } from '@/components/model-grid';

interface HomeModel {
  id: string
  title: string
  description: string
  category: string
  tags: string[]
  thumbnailUrl: string | null
  likes: number
  downloads: number
  views: number
  author: {
    id: string
    name: string
    username: string
    avatarUrl: string | null
  }
  publishedAt: string
  createdAt: string
}

interface ApiResponse {
  success: boolean
  message: string
  data: {
    models: HomeModel[]
    category: string
    search: string | null
    pagination: any
    isEmpty: boolean
    isEmptyDatabase?: boolean
  }
}

export default function Home() {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [recentModels, setRecentModels] = React.useState<HomeModel[]>([])
  const [popularModels, setPopularModels] = React.useState<HomeModel[]>([])
  const [trendingModels, setTrendingModels] = React.useState<HomeModel[]>([])
  const [loading, setLoadingState] = React.useState(true)
  const [isEmptyDatabase, setIsEmptyDatabase] = React.useState(false)
  
  const currentSearch = searchParams.get('search') || ''

  const fetchHomeData = React.useCallback(async (searchTerm?: string) => {
    try {
      setLoadingState(true)
      setIsEmptyDatabase(false)
      dispatch(setLoading(true))
      
      console.log('🔄 Fetching home data...', { searchTerm })
      
      const fetchOptions = {
        limit: 8,
        ...(searchTerm && searchTerm.trim().length > 0 && { search: searchTerm.trim() })
      }
      
      const promises = [
        fetchModelsFeed('recent', fetchOptions),
        fetchModelsFeed('popular', fetchOptions),
        fetchModelsFeed('trending', fetchOptions)
      ]
      
      const results = await Promise.allSettled(promises)
      const [recentResult, popularResult, trendingResult] = results
      
      // Process results and check for empty database
      let databaseEmpty = false
      
      if (recentResult.status === 'fulfilled' && recentResult.value?.success) {
        const data = recentResult.value as ApiResponse
        setRecentModels(data.data?.models || [])
        if (data.data?.isEmptyDatabase) {
          databaseEmpty = true
        }
      } else {
        setRecentModels([])
      }
      
      if (popularResult.status === 'fulfilled' && popularResult.value?.success) {
        const data = popularResult.value as ApiResponse
        setPopularModels(data.data?.models || [])
        if (data.data?.isEmptyDatabase) {
          databaseEmpty = true
        }
      } else {
        setPopularModels([])
      }
      
      if (trendingResult.status === 'fulfilled' && trendingResult.value?.success) {
        const data = trendingResult.value as ApiResponse
        setTrendingModels(data.data?.models || [])
        if (data.data?.isEmptyDatabase) {
          databaseEmpty = true
        }
      } else {
        setTrendingModels([])
      }
      
      setIsEmptyDatabase(databaseEmpty)
      console.log('✅ Home data loaded. Database empty:', databaseEmpty)
      
    } catch (error: any) {
      console.error('❌ Failed to fetch home data:', error)
      setRecentModels([])
      setPopularModels([])
      setTrendingModels([])
      setIsEmptyDatabase(true)
    } finally {
      setLoadingState(false)
      dispatch(setLoading(false))
    }
  }, [dispatch])

  React.useEffect(() => {
    fetchHomeData(currentSearch)
  }, [currentSearch, fetchHomeData])

  const handleModelClick = React.useCallback((modelId: string) => {
    console.log('🔗 Model clicked:', modelId)
    router.push(`/product?id=${modelId}`)
  }, [router])

  const ModelCard = React.memo(({ model }: { model: HomeModel }) => (
    <div 
      className="bg-card rounded-lg overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => handleModelClick(model.id)}
    >
      <div className="aspect-video bg-muted relative overflow-hidden">
        {model.thumbnailUrl ? (
          <img 
            src={model.thumbnailUrl} 
            alt={model.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
              if (target.parentElement) {
                target.parentElement.innerHTML = `
                  <div class="w-full h-full bg-muted flex items-center justify-center">
                    <span class="text-muted-foreground">No preview</span>
                  </div>
                `
              }
            }}
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <span className="text-muted-foreground">No preview</span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-[16px] mb-2 line-clamp-2">{model.title}</h3>
        
        <div className="flex items-center gap-2 mb-3">
          <Avatar className="size-[24px]">
            {model.author.avatarUrl && (
              <AvatarImage 
                src={model.author.avatarUrl} 
                alt={model.author.name}
                className="object-cover"
              />
            )}
            <AvatarFallback className="text-xs">
              {model.author.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">{model.author.name}</span>
        </div>
        
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <BiLike className="size-[16px]" />
              <span>{model.likes}</span>
            </div>
            <div className="flex items-center gap-1">
              <MdOutlineFileDownload className="size-[16px]" />
              <span>{model.downloads}</span>
            </div>
            <div className="flex items-center gap-1">
              <IoMdShareAlt className="size-[16px]" />
              <span>{model.views}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  ))

  ModelCard.displayName = 'ModelCard'

  // Component for empty state
  const EmptyState = React.memo(() => (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
        <span className="text-3xl">📦</span>
      </div>
      <h2 className="text-2xl font-bold mb-4 text-foreground">
        Belum ada product
      </h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        Saat ini belum ada product yang tersedia di database. 
        Jadilah yang pertama untuk mengunggah product 3D medical model!
      </p>
      <Button 
        onClick={() => router.push('/upload')}
        className="px-6 py-2"
      >
        Upload Product Pertama
      </Button>
    </div>
  ))

  EmptyState.displayName = 'EmptyState'

  // Update ModelSection component untuk tidak transform data lagi
  const ModelSection = React.memo(({ title, models, loading }: {
    title: string
    models: any[]
    loading: boolean
  }) => {
    const handleModelClick = (model: any) => {
      console.log('🎯 Navigating to model:', model.id)
      router.push(`/product?id=${model.id}`)
    }

    return (
      <ModelGrid 
        title={title} 
        models={models} // Langsung pass data dari API tanpa transform
        onModelClick={handleModelClick}
        loading={loading}
      />
    )
  })

  ModelSection.displayName = 'ModelSection'

  const hasAnyModels = recentModels.length > 0 || popularModels.length > 0 || trendingModels.length > 0

  return (
    <div className="h-screen bg-background">
      <Navbar />
      
      <main className="pt-[80px] pb-[100px] px=[32px]">
        <div className="mx-auto">
          {/* Show "Belum ada product" if database is empty */}
          {!loading && isEmptyDatabase ? (
            <EmptyState />
          ) : loading ? (
            /* Loading State */
            <>

              <ModelSection 
                title="Recent Models" 
                models={[]} 
                loading={true} 
              />
              <ModelSection 
                title="Popular Models" 
                models={[]} 
                loading={true} 
              />
              <ModelSection 
                title="Trending Models" 
                models={[]} 
                loading={true} 
              />
            </>
          ) : (
            /* Model Sections */
            <>
              <ModelSection 
                title="Recent Models" 
                models={recentModels} 
                loading={false} 
              />
              
              <ModelSection 
                title="Popular Models" 
                models={popularModels} 
                loading={false} 
              />
              
              <ModelSection 
                title="Trending Models" 
                models={trendingModels} 
                loading={false} 
              />
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  )
}
