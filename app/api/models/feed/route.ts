// app/api/models/feed/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const feedQuerySchema = z.object({
  category: z.enum(['recent', 'popular', 'trending']).default('recent'),
  limit: z.coerce.number().min(1).max(50).default(8),
  page: z.coerce.number().min(1).default(1),
  search: z.string().nullable().optional()
    .transform(val => val === null || val === '' || val === 'null' ? undefined : val)
})

export async function GET(request: NextRequest) {
  console.log('🏠 Home Feed API - Starting request')
  
  try {
    const { searchParams } = new URL(request.url)
    
    const rawSearch = searchParams.get('search')
    const rawParams = {
      category: searchParams.get('category') || 'recent',
      limit: searchParams.get('limit') || '8',
      page: searchParams.get('page') || '1',
      search: rawSearch === 'null' || rawSearch === '' ? null : rawSearch
    }
    
    const parseResult = feedQuerySchema.safeParse(rawParams)
    
    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Invalid query parameters',
        details: parseResult.error.errors
      }, { status: 400 })
    }
    
    const { category, limit, page, search } = parseResult.data
    
    try {
      await prisma.$connect()
      
      // First, check if database has any models at all
      const totalModelsInDb = await prisma.model.count()
      console.log(`📊 Total models in database: ${totalModelsInDb}`)
      
      // If no models exist in database at all
      if (totalModelsInDb === 0) {
        console.log('📭 Database is empty - no models exist')
        return NextResponse.json({
          success: true,
          message: 'Belum ada product',
          data: {
            models: [],
            category,
            search: search || null,
            pagination: {
              page: 1,
              limit,
              total: 0,
              totalPages: 0,
              hasNext: false,
              hasPrev: false
            },
            isEmpty: true,
            isEmptyDatabase: true // Flag untuk database kosong
          }
        })
      }
      
      // Build where clause for published models
      const whereClause: any = {
        status: 'published',
        visibility: 'public'
      }
      
      // Add search filter if exists
      if (search && search.trim().length > 0) {
        const searchTerm = search.trim()
        whereClause.OR = [
          { title: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
          { category: { contains: searchTerm, mode: 'insensitive' } },
          { tags: { hasSome: [searchTerm] } }
        ]
      }
      
      // Check published models count
      const publishedModelsCount = await prisma.model.count({ where: whereClause })
      console.log(`📊 Published models matching criteria: ${publishedModelsCount}`)
      
      // If no published models match criteria
      if (publishedModelsCount === 0) {
        return NextResponse.json({
          success: true,
          message: search 
            ? `Tidak ada product yang ditemukan untuk pencarian: "${search}"`
            : 'Belum ada product yang dipublikasi',
          data: {
            models: [],
            category,
            search: search || null,
            pagination: {
              page: 1,
              limit,
              total: 0,
              totalPages: 0,
              hasNext: false,
              hasPrev: false
            },
            isEmpty: true,
            isEmptyDatabase: false
          }
        })
      }
      
      // Determine ordering
      let orderBy: any
      switch (category) {
        case 'recent':
          orderBy = [{ publishedAt: 'desc' }, { createdAt: 'desc' }]
          break
        case 'popular':
          orderBy = [{ likes: 'desc' }, { downloads: 'desc' }, { views: 'desc' }]
          break
        case 'trending':
          orderBy = [{ updatedAt: 'desc' }, { likes: 'desc' }, { views: 'desc' }]
          break
        default:
          orderBy = [{ createdAt: 'desc' }]
      }
      
      // Fetch models
      const [models, totalCount] = await Promise.all([
        prisma.model.findMany({
          where: whereClause,
          orderBy,
          take: limit,
          skip: (page - 1) * limit,
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
            publishedAt: true,
            createdAt: true,
            author: {
              select: {
                id: true,
                displayName: true,
                username: true,
                avatarUrl: true
              }
            }
          }
        }),
        prisma.model.count({ where: whereClause })
      ])
      
      // Format response
      const transformedModels = models.map(model => ({
        id: model.id,
        title: model.title,
        description: model.description,
        category: model.category,
        thumbnailUrl: model.coverImageUrl,
        coverImageUrl: model.coverImageUrl,
        likes: model.likes,
        downloads: model.downloads,
        views: model.views,
        createdAt: model.createdAt.toISOString(),
        // Author sebagai object (jangan di-flatten)
        author: {
          id: model.author.id,
          name: model.author.displayName || model.author.username || 'Anonymous User',
          username: model.author.username,
          avatarUrl: model.author.avatarUrl
        }
      }))
      
      const totalPages = Math.ceil(totalCount / limit)
      
      return NextResponse.json({
        success: true,
        message: `Successfully fetched ${category} products`,
        data: {
          models: transformedModels,
          category,
          search: search || null,
          pagination: {
            page,
            limit,
            total: totalCount,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
          },
          isEmpty: false,
          isEmptyDatabase: false
        }
      })
      
    } catch (queryError) {
      console.error('❌ Database query failed:', queryError)
      
      return NextResponse.json({
        success: true,
        message: 'Belum ada product',
        data: {
          models: [],
          category,
          search: search || null,
          pagination: {
            page: 1,
            limit,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false
          },
          isEmpty: true,
          isEmptyDatabase: true
        }
      })
    }
    
  } catch (error: any) {
    console.error('❌ Unexpected API error:', error)
    
    return NextResponse.json({
      success: true,
      message: 'Belum ada product',
      data: {
        models: [],
        category: 'recent',
        search: null,
        pagination: {
          page: 1,
          limit: 8,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        },
        isEmpty: true,
        isEmptyDatabase: true
      }
    })
  } finally {
    try {
      await prisma.$disconnect()
    } catch (disconnectError) {
      console.warn('⚠️ Database disconnect warning:', disconnectError)
    }
  }
}