'use client'

import { Card, CardContent } from '@/components/ui/card'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/lib/store'
import { updateModelLikes, updateModelDownloads } from '@/lib/features/models/modelsSlice'
import { BiLike } from 'react-icons/bi';
import { MdOutlineFileDownload } from 'react-icons/md';
import { IoMdShareAlt } from 'react-icons/io';
import { Button } from '@/components/ui/button';
import { LuHistory, LuTag } from "react-icons/lu";
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@radix-ui/react-avatar';
import { AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter, useSearchParams } from 'next/navigation';
import { PreviewSelector } from '@/components/3d/preview-selector';
import { MdClear } from "react-icons/md";
import { fetchModelDetail, handleModelAction } from '@/lib/api-client/models-feed'; // API client yang sudah dibuat
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';

// Interface untuk product data dari API
interface ProductModel {
  id: string
  title: string
  description: string
  category: string
  tags: string[]
  coverImageUrl: string | null
  modelFileUrl: string | null
  likes: number
  downloads: number
  views: number
  status: string
  license: {
    type: string
    allowCommercialUse: boolean
    allowSharing: boolean
    allowAdaptations: boolean
  }
  nsfwContent: boolean
  author: {
    id: string
    name: string
    username: string
    avatarUrl: string | null
    bio: string
    region: string
    memberSince: string
  }
  timestamps: {
    createdAt: string
    updatedAt: string
    publishedAt: string | null
  }
  relatedModels: Array<{
    id: string
    title: string
    thumbnailUrl: string | null
    likes: number
    downloads: number
    views: number
    author: {
      name: string
      username: string
      avatarUrl: string | null
    }
  }>
  permissions: {
    canEdit: boolean
    canDownload: boolean
    canLike: boolean
    canShare: boolean
    isOwner: boolean
  }
}

export default function ProductPage() {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  
  // State management
  const [product, setProduct] = useState<ProductModel | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  
  // Get model ID dari URL
  const modelId = searchParams.get('id')

  // Function untuk fetch product detail
  const fetchProductData = async () => {
    if (!modelId) {
      setError('Model ID is required')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      console.log('🔄 Fetching product detail for:', modelId)
      
      const response = await fetchModelDetail(modelId)
      
      if (response.success) {
        setProduct(response.data)
        console.log('✅ Product detail loaded:', response.data.title)
      } else {
        setError(response.message || 'Failed to load model details')
      }
      
    } catch (error: any) {
      console.error('❌ Failed to fetch product detail:', error)
      
      if (error.message === 'Model not found') {
        setError('This model could not be found. It may have been removed or made private.')
      } else if (error.message === 'Access denied') {
        setError('You do not have permission to view this model.')
      } else {
        setError('Failed to load model details. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Effect untuk load data
  useEffect(() => {
    fetchProductData()
  }, [modelId])

  // Function untuk handle actions
  const handleLike = async () => {
    if (!product || !session) {
      toast.error('Please login to like models')
      return
    }

    if (product.permissions.isOwner) {
      toast.error('You cannot like your own model')
      return
    }

    try {
      setActionLoading('like')
      
      const action = product.permissions.canLike ? 'like' : 'unlike'
      const response = await handleModelAction(product.id, action, { source: 'product_page' })
      
      if (response.success) {
        // Update local state
        setProduct(prev => prev ? {
          ...prev,
          likes: response.data.newLikesCount,
          permissions: {
            ...prev.permissions,
            canLike: !prev.permissions.canLike
          }
        } : null)
        
        // Update Redux state
        dispatch(updateModelLikes({ 
          id: product.id, 
          likes: response.data.newLikesCount 
        }))
        
        toast.success(response.data.message)
      }
      
    } catch (error: any) {
      console.error('Like action failed:', error)
      toast.error(error.message || 'Failed to like model')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDownload = async () => {
    if (!product) return

    if (!session) {
      toast.error('Please login to download models')
      return
    }

    if (!product.permissions.canDownload) {
      toast.error('This model is not available for download')
      return
    }

    try {
      setActionLoading('download')
      
      const response = await handleModelAction(product.id, 'download', { source: 'product_page' })
      
      if (response.success) {
        // Update local state
        setProduct(prev => prev ? {
          ...prev,
          downloads: response.data.newDownloadsCount
        } : null)
        
        // Update Redux state
        dispatch(updateModelDownloads({ 
          id: product.id, 
          downloads: response.data.newDownloadsCount 
        }))
        
        // Handle actual file download
        if (response.data.downloadUrl && product.modelFileUrl) {
          const link = document.createElement('a')
          link.href = product.modelFileUrl
          link.download = `${product.title}.stl` // atau extension yang sesuai
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }
        
        toast.success('Download started successfully')
      }
      
    } catch (error: any) {
      console.error('Download action failed:', error)
      toast.error(error.message || 'Failed to download model')
    } finally {
      setActionLoading(null)
    }
  }

  const handleShare = async () => {
    if (!product) return

    try {
      const shareData = {
        title: product.title,
        text: `Check out this 3D model: ${product.title}`,
        url: window.location.href,
      }

      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href)
        toast.success('Link copied to clipboard!')
      }
    } catch (error) {
      console.error('Share failed:', error)
      // Fallback untuk copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href)
        toast.success('Link copied to clipboard!')
      } catch (clipboardError) {
        toast.error('Failed to share model')
      }
    }
  }

  const handleClose = () => {
    router.back()
  }

  const handleRelatedModelClick = (relatedModel: any) => {
    router.push(`/product?id=${relatedModel.id}`)
  }

  // Format date helper
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown'
    
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffTime = now.getTime() - date.getTime()
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays === 0) return 'Today'
      if (diffDays === 1) return '1 day ago'
      if (diffDays < 7) return `${diffDays} days ago`
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
      
      return date.toLocaleDateString()
    } catch {
      return 'Unknown'
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading model details...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Model Not Found</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => router.push('/')}>
              Go Home
            </Button>
            <Button variant="outline" onClick={() => router.back()}>
              Go Back
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Render product page (menggunakan struktur HTML yang sudah ada)
  return (
    <div className='bg-black/50 p-[50px] relative'>
      {/* close button */}
      <MdClear 
        className='absolute top-[18px] right-[18px] text-white hover:bg-transparent hover:text-red-500 size-[28px] cursor-pointer' 
        onClick={handleClose} 
      />
      
      <Card className='p-[50px] bg-white rounded-[12px]'>
        <CardContent>
          <div className="flex gap-[32px] overflow-hidden">
            {/* div kiri - mengambil sisa ruang */}
            <div className="flex-1">
              {/* autor informasi */}
              <div className='flex items-center gap-[12px] mb-[18px]'>
                <Avatar className="size-[55px]">
                  {product.author.avatarUrl && (
                    <AvatarImage 
                      src={product.author.avatarUrl} 
                      alt={product.author.name}
                      className="object-cover"
                    />
                  )}
                  <AvatarFallback>
                    {product.author.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="gap-[4px] flex flex-col">
                  <div className="font-bold text-[16px]">
                    {product.author.name}
                  </div>
                  <div className="font-medium text-[12px] text-muted-foreground">
                    @{product.author.username}
                  </div>
                </div>
              </div>

              {/* judul produk */}
              <h1 className='font-bold text-[32px] mb-[12px]'>{product.title}</h1>
              
              {/* button like, download, share */}
              <div className='gap-[12px] flex items-center'>
                <div className='flex gap-[18px]'>
                  <Button 
                    variant='ghost'
                    onClick={handleLike}
                    disabled={!!actionLoading || !product.permissions.canLike}
                    className={product.permissions.canLike ? '' : 'opacity-50'}
                  >
                    <BiLike className="size-[20px] mr-[2px]" />
                    {actionLoading === 'like' ? 'Loading...' : `${product.likes} Likes`}
                  </Button>
                  
                  <Button 
                    variant='ghost'
                    onClick={handleDownload}
                    disabled={!!actionLoading || !product.permissions.canDownload}
                  >
                    <MdOutlineFileDownload className="size-[20px] mr-[2px]" />
                    {actionLoading === 'download' ? 'Loading...' : `${product.downloads} Downloads`}
                  </Button>
                  
                  <Button 
                    variant='ghost'
                    onClick={handleShare}
                    disabled={!!actionLoading}
                  >
                    <IoMdShareAlt className="size-[20px] mr-[2px]" />
                    {product.views} Views
                  </Button>
                </div>
              </div>
              
              <Button 
                className='w-[190px] h-[61px] bg-blue-600 text-white font-bold text-[20px] rounded-[8px] mt-[24px] hover:bg-blue-700 transition-colors'
                onClick={handleDownload}
                disabled={!!actionLoading || !product.permissions.canDownload}
              >
                {actionLoading === 'download' ? 'Downloading...' : 'Download'}
              </Button>
              
              <hr className='border-t border-gray-300 my-[14px]'/>
              
              <div className='gap-[14px]'>
                <h3 className='font-bold text-[24px]'>Description</h3>
                <p className='text-[16px] text-[#2E2E2E]'>{product.description}</p>
              </div>
              
              <div className='mt-[18px] flex flex-col gap-[4px]'>
                <p className='text-[12px]'>
                  License: {product.license.type}
                </p>
                <p className='flex items-center gap-[4px] text-muted-foreground text-[14px]'>
                  <LuHistory className='size-[18px]'/>
                  Published {formatDate(product.timestamps.publishedAt)}
                </p>
                
                {product.tags && product.tags.length > 0 && (
                  <div className='flex items-center gap-[8px]'>
                    <LuTag className='size-[18px]'/>
                    {product.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* div kanan - lebar tetap 374px */}
            <div className="flex flex-col gap-[24px] w-[374px] overflow-y-auto">
              {/* 3D preview */}
              <div className="flex flex-col gap-[12px]">
                <PreviewSelector 
                  modelUrl={product.modelFileUrl || undefined}
                  imageUrl={product.coverImageUrl || undefined}
                  className="w-full h-[280px]"
                />
              </div>

              {/* related models */}
              {product.relatedModels && product.relatedModels.length > 0 && (
                <div className="mt-[24px]">
                  <h3 className="font-bold text-[20px] mb-[16px]">Related Models</h3>
                  <div className="space-y-[12px]">
                    {product.relatedModels.map((relatedModel) => (
                      <div 
                        key={relatedModel.id} 
                        className="flex gap-[12px] p-[12px] bg-gray-50 rounded-[8px] cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleRelatedModelClick(relatedModel)}
                      >
                        <div className="w-[80px] h-[60px] bg-muted rounded-[4px] overflow-hidden">
                          {relatedModel.thumbnailUrl ? (
                            <img 
                              src={relatedModel.thumbnailUrl} 
                              alt={relatedModel.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                              <span className="text-xs text-muted-foreground">No preview</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-[16px] font-medium">{relatedModel.title}</p>
                          <p className="text-[14px] text-gray-600">{relatedModel.author.name}</p>
                          <div className="flex items-center gap-[12px] text-[12px] text-muted-foreground">
                            <div className="flex items-center gap-[4px]">
                              <BiLike className="size-[12px]"/>
                              {relatedModel.likes}
                            </div>
                            <div className="flex items-center gap-[4px]">
                              <MdOutlineFileDownload className="size-[12px]"/>
                              {relatedModel.downloads}
                            </div>
                            <div className="flex items-center gap-[4px]">
                              <IoMdShareAlt className="size-[12px]"/>
                              {relatedModel.views}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
