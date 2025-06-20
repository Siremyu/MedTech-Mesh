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
import { fetchModelDetail, handleModelAction } from '@/lib/api-client/models-feed';
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
  galleryImages?: string[]
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
  timestamps?: {
    createdAt: string
    updatedAt: string
    publishedAt: string | null
  }
  createdAt: string
  publishedAt: string | null
  updatedAt?: string
  
  relatedModels: Array<{
    id: string
    title: string
    thumbnailUrl: string | null
    likes: number
    downloads: number
    views: number
    author: {
      id: string
      name: string
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const { data: session } = useSession()
  
  // State management
  const [product, setProduct] = useState<ProductModel | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  
  // Get model ID dari URL
  const modelId = searchParams.get('id')

  // Format date function
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Not published yet'
    
    try {
      const date = new Date(dateString)
      
      if (isNaN(date.getTime())) {
        return 'Invalid date'
      }
      
      const now = new Date()
      const diffTime = now.getTime() - date.getTime()
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays === 0) return 'Today'
      if (diffDays === 1) return '1 day ago'
      if (diffDays < 7) return `${diffDays} days ago`
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
      
      return date.toLocaleDateString()
    } catch (error) {
      console.error('Date formatting error:', error)
      return 'Unknown date'
    }
  }

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
      
      if (response.success && response.data) {
        const productData = response.data
        
        // Ensure timestamps exist
        if (!productData.timestamps && !productData.createdAt) {
          console.warn('⚠️ Missing timestamp data, using fallbacks')
          productData.timestamps = {
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            publishedAt: null
          }
          productData.createdAt = new Date().toISOString()
        }
        
        setProduct(productData)
        console.log('✅ Product detail loaded:', productData.title)
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

  // Debug log untuk product data structure
  useEffect(() => {
    if (product) {
      console.log('🔍 Product data structure:', {
        hasTimestamps: !!product.timestamps,
        timestampsKeys: product.timestamps ? Object.keys(product.timestamps) : 'none',
        publishedAt: product.timestamps?.publishedAt || product.publishedAt,
        createdAt: product.timestamps?.createdAt || product.createdAt,
        modelFileUrl: product.modelFileUrl,
        coverImageUrl: product.coverImageUrl,
        galleryImages: product.galleryImages?.length || 0,
        // Add detailed 3D model info
        modelFileDetails: {
          url: product.modelFileUrl,
          isValid: !!(product.modelFileUrl && product.modelFileUrl.trim()),
          extension: product.modelFileUrl ? product.modelFileUrl.split('.').pop() : 'none',
          fullPath: product.modelFileUrl
        }
      })
      
      // Test if model URL is accessible
      if (product.modelFileUrl) {
        console.log('🧪 Testing model URL accessibility...')
        fetch(product.modelFileUrl, { method: 'HEAD' })
          .then(response => {
            console.log('✅ Model URL accessible:', response.status, response.headers.get('content-type'))
          })
          .catch(error => {
            console.error('❌ Model URL not accessible:', error)
          })
      }
    }
  }, [product])

  const handleClose = () => {
    router.back();
  };

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
        setProduct(prev => prev ? {
          ...prev,
          likes: response.data.newLikesCount,
          permissions: {
            ...prev.permissions,
            canLike: !prev.permissions.canLike
          }
        } : null)
        
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
        setProduct(prev => prev ? {
          ...prev,
          downloads: response.data.newDownloadsCount
        } : null)
        
        dispatch(updateModelDownloads({ 
          id: product.id, 
          downloads: response.data.newDownloadsCount 
        }))
        
        // Handle actual file download
        if (response.data.downloadUrl && product.modelFileUrl) {
          const link = document.createElement('a')
          link.href = product.modelFileUrl
          link.download = `${product.title}.stl`
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
        await navigator.clipboard.writeText(window.location.href)
        toast.success('Link copied to clipboard!')
      }
    } catch (error) {
      console.error('Share failed:', error)
      try {
        await navigator.clipboard.writeText(window.location.href)
        toast.success('Link copied to clipboard!')
      } catch (clipboardError) {
        toast.error('Failed to share or copy link')
      }
    }
  }

  const handleRelatedModelClick = (relatedModel: any) => {
    router.push(`/product?id=${relatedModel.id}`);
  };

  // Loading state
  if (loading) {
    return (
      <div className='bg-black/50 p-[50px] relative'>
        <MdClear className='absolute top-[18px] right-[18px] text-white hover:bg-transparent hover:text-red-500 size-[28px]' onClick={handleClose} />
        <Card className='p-[50px] bg-white rounded-[12px]'>
          <CardContent>
            <div className="flex items-center justify-center h-[500px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading model details...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (error || !product) {
    return (
      <div className='bg-black/50 p-[50px] relative'>
        <MdClear className='absolute top-[18px] right-[18px] text-white hover:bg-transparent hover:text-red-500 size-[28px]' onClick={handleClose} />
        <Card className='p-[50px] bg-white rounded-[12px]'>
          <CardContent>
            <div className="flex items-center justify-center h-[500px]">
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
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='bg-black/50 p-[50px] relative'>
        {/* close button */}
        <MdClear className='absolute top-[18px] right-[18px] text-white hover:bg-transparent hover:text-red-500 size-[28px]' onClick={handleClose} />
        <Card className='p-[50px] bg-white rounded-[12px]'>
            <CardContent>
                <div className="flex gap-[32px] overflow-hidden">
                    {/* div kiri - mengambil sisa ruang */}
                    <div className="flex-1">
                        <div className="h-[500px] relative rounded-[4px] overflow-hidden">
                          {/* Author info overlay */}
                          <div className='flex items-center gap-[12px] absolute left-[12px] top-[12px] z-10 p-3'>
                            <Avatar className="w-12 h-12"> {/* Fixed size instead of default */}
                              {product.author.avatarUrl && (
                                <AvatarImage 
                                  src={product.author.avatarUrl} 
                                  alt={product.author.name}
                                  className="object-cover"
                                />
                              )}
                              <AvatarFallback className='w-12 h-12 text-sm'> {/* Fixed size and smaller text */}
                                {product.author.name.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className='flex-col gap-[4px]'>
                              <p className='text-white font-bold text-[18px]'>{product.author.name}</p>
                              <p className='text-gray-200 font-medium text-[12px]'>@{product.author.username}</p>
                            </div>
                          </div>
                          
                          {/* 3D/Image Preview Component */}
                          <PreviewSelector
                            modelUrl={product.modelFileUrl || undefined}
                            imageUrl={product.coverImageUrl || undefined}
                            images={product.galleryImages || []}
                            className="w-full h-full"
                          />
                        </div>
                        
                        <div className='gap-[4px]'>
                            <div className='mt-[12px] flex justify-between'>
                                <div>
                                    <p className='text-[24px] font-bold'>{product.title}</p>
                                    <p className='text-[20px] text-gray-600 mt-[2px]'>
                                        {product.category}
                                    </p>
                                </div>
                                <div className='flex'>
                                    <Button 
                                      className='text-[16px] text-gray-500 cursor-pointer hover:text-red-500' 
                                      variant='ghost'
                                      onClick={handleLike}
                                      disabled={!!actionLoading || !product.permissions.canLike}
                                    >
                                        <BiLike className="size-[20px] mr-[2px]" />
                                        {product.likes} Likes
                                    </Button>
                                    <Button className='text-[16px] text-gray-500 cursor-pointer' variant='ghost'>
                                        <MdOutlineFileDownload className="size-[20px] mr-[2px]" />
                                        {product.downloads} Downloads
                                    </Button>
                                    <Button 
                                      className='text-[16px] text-gray-500 cursor-pointer' 
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
                        </div>
                        <hr className='border-t border-gray-300 my-[14px]'/>
                        <div className='gap-[14px]'>
                            <h3 className='font-bold text-[24px]'>Description</h3>
                            {/* hasil inputan deskripsi oleh kreator */}
                            <p className='text-[16px] text-[#2E2E2E]'>{product.description}</p>
                        </div>
                        <div className='mt-[18px] flex flex-col gap-[4px]'>
                            <p className='text-[12px]'>
                                License: {product.license?.type || 'Standard'}
                            </p>
                            <p className='flex items-center gap-[4px] text-muted-foreground text-[14px]'>
                                <LuHistory className='size-[18px]'/>
                                Published {formatDate(
                                  product.timestamps?.publishedAt || 
                                  product.publishedAt || 
                                  product.timestamps?.createdAt || 
                                  product.createdAt
                                )}
                            </p>
                            {/* tag yang digunakan kreator */}
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
                      {/* image preview placeholder */}
                      <div className="flex flex-col gap-[12px]">
                        {product.galleryImages && product.galleryImages.length > 0 ? (
                          product.galleryImages.map((image, index) => (
                            <div key={index} className="w-full h-[200px] bg-gray-400 items-center justify-center flex rounded-[4px] overflow-hidden">
                              <img 
                                src={image} 
                                alt={`Gallery image ${index + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.style.display = 'none'
                                }}
                              />
                            </div>
                          ))
                        ) : product.coverImageUrl ? (
                          <div className="w-full h-[200px] bg-gray-400 items-center justify-center flex rounded-[4px] overflow-hidden">
                            <img 
                              src={product.coverImageUrl} 
                              alt="Cover image"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.parentElement!.innerHTML = '<span class="text-gray-600">image preview 1</span>'
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-full h-[200px] bg-gray-400 items-center justify-center flex rounded-[4px]">
                            <span className="text-gray-600">No images available</span>
                          </div>
                        )}
                      </div>
                      
                      {product.relatedModels && product.relatedModels.length > 0 && (
                        <div className="flex flex-col gap-[14px]">
                          <p className="text-[16px] font-bold">RELATED MODELS</p>
                          
                          {product.relatedModels.map((relatedModel, index) => (
                            <div 
                              key={index}
                              className="flex items-center gap-[10px] p-3 border rounded-[4px] cursor-pointer hover:bg-gray-50 transition-colors"
                              onClick={() => handleRelatedModelClick(relatedModel)}
                            >
                              <div className="w-[80px] h-[60px] bg-gray-400 rounded flex-shrink-0 overflow-hidden">
                                {relatedModel.thumbnailUrl ? (
                                  <img 
                                    src={relatedModel.thumbnailUrl} 
                                    alt={relatedModel.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gray-400"></div>
                                )}
                              </div>
                              <div className="flex flex-col gap-[4px] flex-1">
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
                      )}
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
  )
}