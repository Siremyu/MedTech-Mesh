// app/api/models/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createModelSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1, 'Category is required'),
  tags: z.array(z.string()).optional().default([]),
  visibility: z.enum(['public', 'private']).default('public'),
  nsfwContent: z.boolean().default(false),
  license: z.object({
    allowAdaptations: z.string(),
    allowCommercialUse: z.string(),
    allowSharing: z.string()
  }),
  communityPost: z.boolean().default(true),
  files: z.array(z.any()),
  coverImageUrl: z.string().optional(),
  modelPictureUrls: z.array(z.string()).optional().default([]),
  modelFileUrl: z.string().optional()
})

export async function POST(request: NextRequest) {
  console.log('📦 Models API - Creating new model')

  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      console.log('❌ Models API - No authenticated user')
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    console.log('✅ Models API - User authenticated:', session.user.email)

    // Parse and validate request body
    const body = await request.json()
    console.log('📝 Model data received:', {
      title: body.title,
      category: body.category,
      filesCount: body.files?.length || 0,
      hasModelFile: !!body.modelFileUrl,
      hasDescription: !!body.description
    })

    const validatedData = createModelSchema.parse(body)

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      console.log('❌ Models API - User not found in database')
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Create model in database
    const newModel = await prisma.model.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        category: validatedData.category,
        tags: validatedData.tags,
        visibility: validatedData.visibility,
        nsfwContent: validatedData.nsfwContent,
        license: JSON.stringify(validatedData.license),
        communityPost: validatedData.communityPost,
        coverImageUrl: validatedData.coverImageUrl,
        modelFileUrl: validatedData.modelFileUrl,
        status: 'verification', // Always start with verification
        authorId: session.user.id,
        likes: 0,
        downloads: 0,
        views: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        publishedAt: null, // Will be set when approved
        rejectionReason: null,
        adminNotes: null
      }
    })

    console.log('✅ Model created successfully:', {
      id: newModel.id,
      title: newModel.title,
      status: newModel.status,
      authorId: newModel.authorId
    })

    return NextResponse.json({
      success: true,
      message: 'Model created successfully and sent for verification',
      model: {
        id: newModel.id,
        title: newModel.title,
        status: newModel.status,
        createdAt: newModel.createdAt,
        description: 'Your model has been submitted for admin review. You can track its status in your profile.'
      }
    })

  } catch (error: any) {
    console.error('❌ Models API Error:', error)

    if (error instanceof z.ZodError) {
      console.log('❌ Validation errors:', error.errors)
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        },
        { status: 400 }
      )
    }

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A model with this title already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Failed to create model',
        details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    )
  }
}

// GET endpoint for fetching models
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const category = searchParams.get('category')
    const authorId = searchParams.get('authorId')
    const status = searchParams.get('status') || 'published'

    const where: any = { status }
    
    if (category && category !== 'all') {
      where.category = category
    }
    
    if (authorId) {
      where.authorId = authorId
    }

    const models = await prisma.model.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            displayName: true,
            username: true,
            avatarUrl: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    })

    const total = await prisma.model.count({ where })

    console.log(`✅ Models fetched: ${models.length}/${total} total`)

    return NextResponse.json({
      models,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error: any) {
    console.error('❌ Get models error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch models' },
      { status: 500 }
    )
  }
}