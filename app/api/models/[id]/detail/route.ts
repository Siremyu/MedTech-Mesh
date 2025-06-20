// app/api/models/[id]/detail/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/**
 * GET /api/models/[id]/detail
 * Mengambil detail lengkap model untuk product page
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('🔍 Product Detail API - Starting request')
  
  try {
    const modelId = params.id
    
    if (!modelId || typeof modelId !== 'string') {
      console.log('❌ Invalid model ID provided')
      return NextResponse.json(
        { error: 'Valid model ID is required' },
        { status: 400 }
      )
    }
    
    console.log('🎯 Fetching model detail for ID:', modelId)
    
    // Get current session untuk permission checking
    const session = await getServerSession(authOptions)
    console.log('👤 Current user session:', session?.user?.email || 'Guest')
    
    // Database connection
    await prisma.$connect()
    console.log('✅ Database connected')
    
    // Fetch model dengan all related data
    const model = await prisma.model.findUnique({
      where: { id: modelId },
      include: {
        author: {
          select: {
            id: true,
            displayName: true,
            username: true,
            avatarUrl: true,
            bio: true,
            region: true,
            createdAt: true
          }
        },
        _count: {
          select: {
            likes_rel: true,
            downloads_rel: true
          }
        }
      }
    })
    
    if (!model) {
      console.log('❌ Model not found:', modelId)
      return NextResponse.json({
        success: false,
        error: 'Model not found',
        message: 'The requested 3D model could not be found'
      }, { status: 404 })
    }
    
    console.log('✅ Model found:', {
      title: model.title,
      status: model.status,
      visibility: model.visibility,
      author: model.author.displayName
    })
    
    // Check permission - hanya show published models atau owner's models
    const isOwner = session?.user?.id === model.authorId
    const isPublished = model.status === 'published'
    const isPublic = model.visibility === 'public'
    
    const canView = isPublished && isPublic || isOwner
    
    if (!canView) {
      console.log('❌ Access denied for model:', modelId)
      return NextResponse.json({
        success: false,
        error: 'Access denied',
        message: 'You do not have permission to view this model'
      }, { status: 403 })
    }
    
    // Increment view count (hanya untuk published models dan bukan owner)
    if (isPublished && !isOwner) {
      try {
        await prisma.model.update({
          where: { id: modelId },
          data: { views: { increment: 1 } }
        })
        console.log('📊 View count incremented')
      } catch (viewError) {
        console.warn('⚠️ Failed to increment view count:', viewError)
      }
    }
    
    // Get related models (same category, exclude current model)
    console.log('🔗 Fetching related models...')
    const relatedModels = await prisma.model.findMany({
      where: {
        AND: [
          { id: { not: modelId } },
          { category: model.category },
          { status: 'published' },
          { visibility: 'public' }
        ]
      },
      take: 6,
      orderBy: [
        { likes: 'desc' },
        { views: 'desc' }
      ],
      select: {
        id: true,
        title: true,
        coverImageUrl: true,
        likes: true,
        downloads: true,
        views: true,
        author: {
          select: {
            id: true,
            displayName: true,
            username: true,
            avatarUrl: true
          }
        }
      }
    })
    
    console.log(`🔗 Found ${relatedModels.length} related models`)
    
    // Parse license JSON safely
    let parsedLicense = {
      type: 'Standard License',
      allowCommercialUse: false,
      allowSharing: true,
      allowAdaptations: true
    }
    
    try {
      if (model.license) {
        const licenseData = JSON.parse(model.license)
        parsedLicense = {
          type: licenseData.type || 'Custom License',
          allowCommercialUse: licenseData.allowCommercialUse === 'yes',
          allowSharing: licenseData.allowSharing === 'yes', 
          allowAdaptations: licenseData.allowAdaptations === 'yes'
        }
      }
    } catch (licenseError) {
      console.warn('⚠️ Failed to parse license JSON:', licenseError)
    }
    
    // Calculate updated view count
    const updatedViews = model.views + (isPublished && !isOwner ? 1 : 0)
    
    // Update the productData structure around line 173
    const productData = {
      id: model.id,
      title: model.title,
      description: model.description || '',
      category: model.category,
      tags: model.tags || [],
      
      // URLs
      coverImageUrl: model.coverImageUrl || null,
      modelFileUrl: model.modelFileUrl || null,
      
      // Stats
      likes: model.likes,
      downloads: model.downloads,
      views: updatedViews,
      
      // Status & visibility
      status: model.status,
      visibility: model.visibility,
      nsfwContent: model.nsfwContent,
      
      // License info
      license: parsedLicense,
      
      // Author information
      author: {
        id: model.author.id,
        name: model.author.displayName || 'Anonymous User',
        username: model.author.username || `user_${model.author.id.slice(0, 8)}`,
        avatarUrl: model.author.avatarUrl || null,
        bio: model.author.bio || '',
        region: model.author.region || '',
        memberSince: model.author.createdAt.toISOString()
      },
      
      // Fix: Ensure timestamps are properly structured
      timestamps: {
        createdAt: model.createdAt.toISOString(),
        updatedAt: model.updatedAt.toISOString(),
        publishedAt: model.publishedAt ? model.publishedAt.toISOString() : null
      },
      
      // Also add these fields at root level for backwards compatibility
      createdAt: model.createdAt.toISOString(),
      publishedAt: model.publishedAt ? model.publishedAt.toISOString() : null,
      
      // Related models
      relatedModels: relatedModels.map((related) => ({
        id: related.id,
        title: related.title,
        thumbnailUrl: related.coverImageUrl,
        likes: related.likes,
        downloads: related.downloads,
        views: related.views,
        author: {
          id: related.author.id || 'unknown',
          name: related.author.displayName || 'Anonymous User'
        }
      })),
      
      // Permissions
      permissions: {
        canEdit: isOwner,
        canDownload: isPublished && isPublic,
        canLike: !!session?.user && !isOwner,
        canShare: isPublished && isPublic,
        isOwner
      }
    }
    
    console.log('🎉 Product detail API completed successfully')
    
    return NextResponse.json({
      success: true,
      message: 'Model details retrieved successfully',
      data: productData
    })
    
  } catch (error: any) {
    console.error('❌ Product Detail API Error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch model details',
      message: 'An error occurred while fetching model information',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
    
  } finally {
    await prisma.$disconnect()
    console.log('🔌 Database disconnected')
  }
}