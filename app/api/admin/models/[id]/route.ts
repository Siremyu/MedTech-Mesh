// app/api/admin/models/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * Admin Model Actions API - /app/api/admin/models/[id]/route.ts
 * PATCH: Approve or reject a specific model
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('🔍 Admin Model Action API - Starting request for model:', params.id)
  
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      console.log('❌ No session found')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check admin privileges - UPDATE THIS to use proper role checking
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, email: true }
    })

    const isAdmin = user?.role === 'ADMIN' || session.user.email === 'admin@medmesh.com'
    if (!isAdmin) {
      console.log('❌ User is not admin:', session.user.email)
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    // Parse request body
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      console.error('❌ Failed to parse request body:', parseError)
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    const { action, rejectionReason, adminNotes } = body

    console.log('📝 Admin action:', { action, modelId: params.id })

    // Validate action
    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "approve" or "reject"' },
        { status: 400 }
      )
    }

    // Validate rejection reason if rejecting
    if (action === 'reject' && !rejectionReason?.trim()) {
      return NextResponse.json(
        { error: 'Rejection reason is required when rejecting a model' },
        { status: 400 }
      )
    }

    // Database connection
    await prisma.$connect()
    console.log('✅ Database connected')

    // Check if model exists
    const model = await prisma.model.findUnique({
      where: { id: params.id },
      include: {
        author: {
          select: {
            id: true,
            displayName: true,
            email: true
          }
        }
      }
    })

    if (!model) {
      console.log('❌ Model not found:', params.id)
      return NextResponse.json(
        { error: 'Model not found' },
        { status: 404 }
      )
    }

    console.log('✅ Model found:', model.title)

    // Check if model is in verification status
    if (model.status !== 'verification') {
      console.log('❌ Model is not in verification status:', model.status)
      return NextResponse.json(
        { error: `Model is in ${model.status} status and cannot be ${action}d` },
        { status: 400 }
      )
    }

    // Update model status
    const updateData: any = {
      status: action === 'approve' ? 'published' : 'rejected',
      publishedAt: action === 'approve' ? new Date() : null,
      rejectionReason: action === 'reject' ? rejectionReason?.trim() : null,
      adminNotes: adminNotes?.trim() || null,
      reviewedBy: session.user.id,
      reviewedAt: new Date(),
      updatedAt: new Date()
    }

    // Ensure we don't set undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key]
      }
    })

    const updatedModel = await prisma.model.update({
      where: { id: params.id },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            displayName: true,
            email: true
          }
        }
      }
    })
    
    console.log(`✅ Model ${action}ed successfully:`, updatedModel.id)

    // TODO: Send notification email to the author
    const notificationMessage = action === 'approve' 
      ? `Your model "${model.title}" has been approved and is now published!`
      : `Your model "${model.title}" was not approved. Reason: ${rejectionReason}`

    console.log('📧 Notification to send:', {
      to: model.author.email,
      message: notificationMessage
    })

    // Return success response
    return NextResponse.json({
      success: true,
      message: `Model ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      data: {
        id: updatedModel.id,
        title: updatedModel.title,
        status: updatedModel.status,
        author: updatedModel.author.displayName,
        action,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error: any) {
    console.error('❌ Admin Model Action API Error:', error)
    
    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      return NextResponse.json({
        success: false,
        error: 'Duplicate constraint violation',
        details: 'This operation conflicts with existing data'
      }, { status: 409 })
    }

    if (error.code === 'P2025') {
      return NextResponse.json({
        success: false,
        error: 'Model not found',
        details: 'The model you are trying to update does not exist'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to update model status',
      message: 'An error occurred while processing the admin action',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
    
  } finally {
    await prisma.$disconnect()
  }
}

/**
 * GET: Get detailed information about a specific model for admin review
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('🔍 Admin Model Detail API - Starting request for model:', params.id)
  
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check admin privileges
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, email: true }
    })

    const isAdmin = user?.role === 'ADMIN' || session.user.email === 'admin@medmesh.com'
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    // Database connection
    await prisma.$connect()

    // Fetch detailed model information
    const model = await prisma.model.findUnique({
      where: { id: params.id },
      include: {
        author: {
          select: {
            id: true,
            displayName: true,
            username: true,
            email: true,
            avatarUrl: true,
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
      return NextResponse.json(
        { error: 'Model not found' },
        { status: 404 }
      )
    }

    // Format detailed response
    const detailedModel = {
      id: model.id,
      title: model.title,
      description: model.description,
      category: model.category,
      tags: model.tags || [],
      coverImageUrl: model.coverImageUrl,
      modelFileUrl: model.modelFileUrl,
      status: model.status,
      visibility: model.visibility,
      nsfwContent: model.nsfwContent,
      likes: model.likes,
      downloads: model.downloads,
      views: model.views,
      author: {
        id: model.author.id,
        displayName: model.author.displayName || 'Anonymous',
        username: model.author.username || `user_${model.author.id.slice(0, 8)}`,
        email: model.author.email,
        avatarUrl: model.author.avatarUrl,
        memberSince: model.author.createdAt.toISOString()
      },
      timestamps: {
        createdAt: model.createdAt.toISOString(),
        updatedAt: model.updatedAt.toISOString(),
        publishedAt: model.publishedAt?.toISOString() || null,
        reviewedAt: model.reviewedAt?.toISOString() || null
      },
      adminInfo: {
        rejectionReason: model.rejectionReason,
        adminNotes: model.adminNotes,
        reviewedBy: model.reviewedBy
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Model details retrieved successfully',
      data: detailedModel
    })

  } catch (error: any) {
    console.error('❌ Admin Model Detail API Error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch model details',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
    
  } finally {
    await prisma.$disconnect()
  }
}