// app/api/profile/models/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  console.log('📦 Profile Models API - Starting request')

  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    
    const userId = searchParams.get('userId')
    const sortBy = searchParams.get('sortBy') || 'recent'
    const status = searchParams.get('status') || 'all'
    const limit = parseInt(searchParams.get('limit') || '20')
    const page = parseInt(searchParams.get('page') || '1')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    console.log('📋 Query params:', { userId, sortBy, status, limit, page })

    // Build where clause
    const where: any = { authorId: userId }
    
    // Filter by status if specified
    if (status !== 'all') {
      where.status = status
    }

    // For non-owners, only show published models
    const isOwner = session?.user?.id === userId
    if (!isOwner) {
      where.status = 'published'
    }

    // Build order clause
    let orderBy: any = { createdAt: 'desc' } // default
    
    switch (sortBy) {
      case 'recent':
        orderBy = { createdAt: 'desc' }
        break
      case 'popular':
        orderBy = { likes: 'desc' }
        break
      case 'downloads':
        orderBy = { downloads: 'desc' }
        break
      case 'alphabetical':
        orderBy = { title: 'asc' }
        break
    }

    // Fetch models
    const models = await prisma.model.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        tags: true,
        coverImageUrl: true,
        likes: true,
        downloads: true,
        views: true,
        status: true,
        createdAt: true,
        publishedAt: true,
        rejectionReason: true,
        adminNotes: true,
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

    // Get total count
    const totalCount = await prisma.model.count({ where })

    // Format models for frontend
    const formattedModels = models.map(model => ({
      id: model.id,
      title: model.title,
      description: model.description,
      category: model.category,
      tags: model.tags,
      thumbnailUrl: model.coverImageUrl,
      likes: model.likes,
      downloads: model.downloads,
      views: model.views,
      status: model.status,
      createdAt: formatRelativeTime(model.createdAt),
      publishedAt: model.publishedAt ? formatRelativeTime(model.publishedAt) : null,
      rejectionReason: model.rejectionReason,
      adminNotes: model.adminNotes,
      author: {
        displayName: model.author.displayName,
        username: model.author.username,
        avatarUrl: model.author.avatarUrl
      }
    }))

    console.log('✅ Models fetched:', {
      count: models.length,
      total: totalCount,
      isOwner,
      status
    })

    return NextResponse.json({
      success: true,
      models: formattedModels,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      },
      filters: {
        sortBy,
        status,
        isOwner
      }
    })

  } catch (error: any) {
    console.error('❌ Profile Models API Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch models',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

// Helper function to format relative time
function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'just now'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} day${days !== 1 ? 's' : ''} ago`
  } else if (diffInSeconds < 2629440) {
    const weeks = Math.floor(diffInSeconds / 604800)
    return `${weeks} week${weeks !== 1 ? 's' : ''} ago`
  } else if (diffInSeconds < 31553280) {
    const months = Math.floor(diffInSeconds / 2629440)
    return `${months} month${months !== 1 ? 's' : ''} ago`
  } else {
    const years = Math.floor(diffInSeconds / 31553280)
    return `${years} year${years !== 1 ? 's' : ''} ago`
  }
}