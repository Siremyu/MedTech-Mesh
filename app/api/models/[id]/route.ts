// app/api/models/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/**
 * GET /api/models/[id]
 * Mengambil detail model berdasarkan ID untuk product page
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('🔍 Product Model API - Starting request')
  
  try {
    const modelId = params.id
    
    if (!modelId) {
      return NextResponse.json(
        { error: 'Model ID is required' },
        { status: 400 }
      )
    }
    
    console.log('🎯 Fetching model:', modelId)
    
    // Database connection
    await prisma.$connect()
    console.log('✅ Database connected')
    
    // Get current session untuk permission checking
    const session = await getServerSession(authOptions)
    
    // Fetch model with all related data
    const model = await prisma.model.findUnique({
      where: { id: modelId },
      include: {
        author: {
          select: {
            id: true,
            displayName: true,
            username: true,
            avatarUrl: true,
            bio: true
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
      return NextResponse.json(
        { 
          success: false,
          error: 'Model not found',
          message: 'The requested model could not be found'
        },
        { status: 404 }
      )
    }
    
    console.log('✅ Model found:', model.title)
    
    // Check permission - only show published models or owner's models
    const isOwner = session?.user?.id === model.authorId
    const canView = model.status === 'published' || 
                   model.visibility === 'public' || 
                   isOwner
    
    if (!canView) {
      console.log('❌ Access denied for model:', modelId)
      return NextResponse.json(
        {
          success: false,
          error: 'Access denied',
          message: 'You do not have permission to view this model'
        },
        { status: 403 }
      )
    }
    
    // Increment view count (only for published models and not owner)
    if (model.status === 'published' && !isOwner) {
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
      orderBy: { likes: 'desc' },
      select: {
        id: true,
        title: true,
        coverImageUrl: true,
        likes: true,
        downloads: true,
        views: true,
        author: {
          select: {
            displayName: true,
            username: true
          }
        }
      }
    })
    
    console.log(`🔗 Found ${relatedModels.length} related models`)
    
    // Parse license JSON safely
    let parsedLicense = 'Standard License'
    try {
      if (model.license) {
        const licenseData = JSON.parse(model.license)
        parsedLicense = licenseData.type || 
                      `${licenseData.allowCommercialUse}, ${licenseData.allowSharing}` ||
                      'Custom License'
      }
    } catch (licenseError) {
      console.warn('⚠️ Failed to parse license:', licenseError)
    }
    
    // Format response data
    const formattedModel = {
      id: model.id,
      title: model.title,
      description: model.description,
      category: model.category,
      tags: model.tags || [],
      coverImageUrl: model.coverImageUrl,
      modelFileUrl: model.modelFileUrl,
      likes: model.likes,
      downloads: model.downloads,
      views: model.views + (model.status === 'published' && !isOwner ? 1 : 0), // Include the increment
      status: model.status,
      license: parsedLicense,
      nsfwContent: model.nsfwContent,
      author: {
        id: model.author.id,
        name: model.author.displayName || 'Anonymous',
        username: model.author.username || `user_${model.author.id.slice(0, 8)}`,
        avatarUrl: model.author.avatarUrl,
        bio: model.author.bio
      },
      timestamps: {
        createdAt: model.createdAt.toISOString(),
        updatedAt: model.updatedAt.toISOString(),
        publishedAt: model.publishedAt?.toISOString()
      },
      // Related models
      relatedModels: relatedModels.map((related: {
        id: string;
        title: string;
        coverImageUrl: string | null;
        likes: number;
        downloads: number;
        views: number;
        author: {
          id: string;
          displayName: string | null;
        };
      }) => ({
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
      permissions: {
        canEdit: isOwner,
        canDownload: model.status === 'published',
        canLike: !!session?.user && !isOwner
      }
    }
    
    console.log('🎉 Product model API completed successfully')
    
    return NextResponse.json({
      success: true,
      message: 'Model data retrieved successfully',
      data: formattedModel
    })
    
  } catch (error: any) {
    console.error('❌ Product Model API Error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch model data',
        message: 'An error occurred while fetching model details',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
    
  } finally {
    await prisma.$disconnect()
  }
}