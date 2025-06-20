// app/api/v1/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const endpoint = searchParams.get('endpoint')
  
  try {
    switch (endpoint) {
      case 'models-feed':
        return handleModelsFeed(request)
      case 'profile':
        return handleProfile(request)
      case 'model-detail':
        return handleModelDetail(request)
      case 'admin-models':
        return handleAdminModels(request)
      default:
        return NextResponse.json({ error: 'Invalid endpoint' }, { status: 400 })
    }
  } catch (error) {
    console.error('API v1 error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const endpoint = searchParams.get('endpoint')
  
  try {
    switch (endpoint) {
      case 'model-action':
        return handleModelAction(request)
      case 'auth':
        return handleAuth(request)
      case 'upload':
        return handleUpload(request)
      default:
        return NextResponse.json({ error: 'Invalid endpoint' }, { status: 400 })
    }
  } catch (error) {
    console.error('API v1 POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function handleModelsFeed(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category') as 'recent' | 'popular' | 'trending'
  const limit = parseInt(searchParams.get('limit') || '8')
  const page = parseInt(searchParams.get('page') || '1')
  
  // Move logic from app/api/models/feed/route.ts here
  const models = await prisma.model.findMany({
    where: { status: 'published', visibility: 'public' },
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
    orderBy: category === 'recent' ? { createdAt: 'desc' } : 
             category === 'popular' ? { likes: 'desc' } : 
             { views: 'desc' },
    take: limit,
    skip: (page - 1) * limit
  })

  return NextResponse.json({
    success: true,
    data: models,
    pagination: {
      page,
      limit,
      total: await prisma.model.count({
        where: { status: 'published', visibility: 'public' }
      })
    }
  })
}

async function handleModelDetail(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const modelId = searchParams.get('id')
  
  if (!modelId) {
    return NextResponse.json({ error: 'Model ID required' }, { status: 400 })
  }
  
  // Move logic from app/api/models/[id]/route.ts here
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
      }
    }
  })
  
  if (!model) {
    return NextResponse.json({ error: 'Model not found' }, { status: 404 })
  }
  
  return NextResponse.json({
    success: true,
    data: model
  })
}

async function handleProfile(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Move logic from app/api/profile/route.ts here
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      models: {
        select: {
          id: true,
          title: true,
          status: true,
          likes: true,
          downloads: true
        }
      }
    }
  })
  
  return NextResponse.json({
    success: true,
    data: user
  })
}

async function handleModelAction(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const { modelId, action } = await request.json()
  
  // Move logic from app/api/models/[id]/actions/route.ts here
  switch (action) {
    case 'like':
      // Handle like logic
      break
    case 'download':
      // Handle download logic
      break
    default:
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }
  
  return NextResponse.json({ success: true })
}

async function handleAuth(request: NextRequest) {
  // Move auth logic here
  return NextResponse.json({ success: true })
}

async function handleUpload(request: NextRequest) {
  // Move upload logic here
  return NextResponse.json({ success: true })
}

async function handleAdminModels(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Move admin logic here
  return NextResponse.json({ success: true })
}