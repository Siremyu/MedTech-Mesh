import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * Admin Models API - /app/api/admin/models/route.ts
 * GET: Fetch models for admin review with filtering and statistics
 */
export async function GET(request: NextRequest) {
  console.log('🔍 Admin Models API - Starting request')
  
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      console.log('❌ No session found')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin using database role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (!user || user.role !== 'ADMIN') {
      console.log('❌ User is not admin:', session.user.email)
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const filter = searchParams.get('filter') || 'verification'
    const sortBy = searchParams.get('sortBy') || 'newest'
    const limit = parseInt(searchParams.get('limit') || '20')
    const page = parseInt(searchParams.get('page') || '1')
    const offset = (page - 1) * limit

    console.log('📊 Admin query params:', { filter, sortBy, limit, page })

    // Database connection
    await prisma.$connect()
    console.log('✅ Database connected')

    // Build where clause based on filter
    let whereClause: any = {}
    
    if (filter !== 'all') {
      whereClause.status = filter
    }

    // Build order clause based on sortBy
    let orderBy: any = {}
    
    switch (sortBy) {
      case 'oldest':
        orderBy.createdAt = 'asc'
        break
      case 'category':
        orderBy = [{ category: 'asc' }, { createdAt: 'desc' }]
        break
      case 'newest':
      default:
        orderBy.createdAt = 'desc'
        break
    }

    // Fetch models with author information
    const models = await prisma.model.findMany({
      where: whereClause,
      orderBy,
      take: limit,
      skip: offset,
      include: {
        author: {
          select: {
            id: true,
            displayName: true,
            username: true,
            email: true,
            avatarUrl: true
          }
        }
      }
    })

    console.log(`✅ Found ${models.length} models for admin review`)

    // Get statistics
    const [pendingCount, approvedCount, rejectedCount, totalCount] = await Promise.all([
      prisma.model.count({ where: { status: 'verification' } }),
      prisma.model.count({ where: { status: 'published' } }),
      prisma.model.count({ where: { status: 'rejected' } }),
      prisma.model.count()
    ])

    const stats = {
      pending: pendingCount,
      approved: approvedCount,
      rejected: rejectedCount,
      total: totalCount
    }

    console.log('📈 Admin statistics:', stats)

    // Format response data
    const formattedModels = models.map(model => ({
      id: model.id,
      title: model.title,
      description: model.description,
      category: model.category,
      tags: model.tags || [],
      coverImageUrl: model.coverImageUrl,
      status: model.status,
      author: {
        id: model.author.id,
        displayName: model.author.displayName || 'Anonymous',
        username: model.author.username || `user_${model.author.id.slice(0, 8)}`,
        email: model.author.email,
        avatarUrl: model.author.avatarUrl
      },
      createdAt: model.createdAt.toISOString(),
      updatedAt: model.updatedAt.toISOString(),
      rejectionReason: model.rejectionReason,
      adminNotes: model.adminNotes
    }))

    return NextResponse.json({
      success: true,
      message: 'Admin models retrieved successfully',
      models: formattedModels,
      stats,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })

  } catch (error: any) {
    console.error('❌ Admin Models API Error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch admin models',
      message: 'An error occurred while fetching models for review',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
    
  } finally {
    await prisma.$disconnect()
  }
}