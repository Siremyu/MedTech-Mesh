// app/api/models/[id]/actions/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { Prisma } from '@prisma/client'

// Validation schema for actions
const actionSchema = z.object({
  action: z.enum(['like', 'unlike', 'download']),
  metadata: z.object({
    userAgent: z.string().optional(),
    timestamp: z.string().optional(),
    source: z.string().optional()
  }).optional()
})

/**
 * POST /api/models/[id]/actions
 * Handle model actions: like, unlike, download
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('🎯 Model Actions API - Starting request')
  
  try {
    const modelId = params.id
    if (!modelId || typeof modelId !== 'string') {
      return NextResponse.json(
        { error: 'Valid model ID is required' },
        { status: 400 }
      )
    }

    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      console.log('❌ Authentication required')
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    console.log('✅ User authenticated:', session.user.email)

    // Parse and validate request body
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

    const validation = actionSchema.safeParse(body)
    if (!validation.success) {
      console.log('❌ Validation failed:', validation.error.errors)
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: validation.error.errors
        },
        { status: 400 }
      )
    }

    const { action, metadata } = validation.data
    console.log(`🎯 Processing ${action} for model: ${modelId} by user: ${userId}`)

    // Connect to database
    await prisma.$connect()

    // Check if model exists and is published
    const model = await prisma.model.findUnique({
      where: { id: modelId },
      select: {
        id: true,
        title: true,
        status: true,
        visibility: true,
        authorId: true,
        likes: true,
        downloads: true,
        modelFileUrl: true
      }
    })

    if (!model) {
      console.log('❌ Model not found:', modelId)
      return NextResponse.json(
        { error: 'Model not found' },
        { status: 404 }
      )
    }

    // Check if model is available for interaction
    if (model.status !== 'published' || model.visibility !== 'public') {
      console.log('❌ Model not available for interaction:', model.status, model.visibility)
      return NextResponse.json(
        { error: 'Model is not available for interaction' },
        { status: 403 }
      )
    }

    // Prevent self-interaction for likes
    if ((action === 'like' || action === 'unlike') && model.authorId === userId) {
      console.log('❌ Self-like prevention for user:', userId)
      return NextResponse.json(
        { error: 'You cannot like your own model' },
        { status: 403 }
      )
    }

    let result: any = {}

    // Process action using transaction for data consistency
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      switch (action) {
        case 'like':
          console.log('❤️ Processing like action...')
          
          // Check if user already liked this model
          const existingLike = await tx.like.findFirst({
            where: {
              userId,
              modelId
            }
          })

          if (existingLike) {
            result = {
              action: 'like',
              modelId,
              newLikesCount: model.likes,
              liked: true,
              message: 'Model already liked by this user'
            }
            console.log('⚠️ User already liked this model')
          } else {
            // Create like record
            await tx.like.create({
              data: { 
                userId, 
                modelId,
                createdAt: new Date()
              }
            })

            // Increment model likes count
            const updatedModel = await tx.model.update({
              where: { id: modelId },
              data: { 
                likes: { increment: 1 },
                updatedAt: new Date()
              },
              select: { likes: true }
            })

            result = {
              action: 'like',
              modelId,
              newLikesCount: updatedModel.likes,
              liked: true,
              message: 'Model liked successfully'
            }

            console.log('✅ Like added successfully, new count:', updatedModel.likes)
          }
          break

        case 'unlike':
          console.log('💔 Processing unlike action...')
          
          // Find and delete the like
          const likeToDelete = await tx.like.findFirst({
            where: {
              userId,
              modelId
            }
          })

          if (!likeToDelete) {
            result = {
              action: 'unlike',
              modelId,
              newLikesCount: model.likes,
              liked: false,
              message: 'Model was not liked by this user'
            }
            console.log('⚠️ No like found to remove')
          } else {
            // Delete like record
            await tx.like.delete({
              where: { id: likeToDelete.id }
            })

            // Decrement model likes count
            const updatedModel = await tx.model.update({
              where: { id: modelId },
              data: { 
                likes: { decrement: 1 },
                updatedAt: new Date()
              },
              select: { likes: true }
            })

            result = {
              action: 'unlike',
              modelId,
              newLikesCount: updatedModel.likes,
              liked: false,
              message: 'Like removed successfully'
            }

            console.log('✅ Like removed successfully, new count:', updatedModel.likes)
          }
          break

        case 'download':
          console.log('⬇️ Processing download action...')
          
          // Check for recent download (prevent spam within 5 minutes)
          const recentDownload = await tx.download.findFirst({
            where: {
              userId,
              modelId,
              createdAt: {
                gte: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
              }
            }
          })

          if (!recentDownload) {
            // Create download record
            await tx.download.create({
              data: { 
                userId, 
                modelId,
                createdAt: new Date()
              }
            })

            // Increment model downloads count
            const updatedModel = await tx.model.update({
              where: { id: modelId },
              data: { 
                downloads: { increment: 1 },
                updatedAt: new Date()
              },
              select: { downloads: true }
            })

            result = {
              action: 'download',
              modelId,
              newDownloadsCount: updatedModel.downloads,
              downloaded: true,
              message: 'Download recorded successfully',
              downloadUrl: model.modelFileUrl || null
            }

            console.log('✅ Download recorded, new count:', updatedModel.downloads)
          } else {
            result = {
              action: 'download',
              modelId,
              newDownloadsCount: model.downloads,
              downloaded: false,
              message: 'Download already recorded recently',
              downloadUrl: model.modelFileUrl || null
            }

            console.log('⚠️ Recent download found, not incrementing count')
          }
          break

        default:
          throw new Error(`Invalid action: ${action}`)
      }
    })

    console.log('🎉 Model action completed successfully')

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error: any) {
    console.error('❌ Model Actions API Error:', error)

    // Handle specific error cases
    if (error.message?.includes('already liked')) {
      return NextResponse.json(
        { error: 'Model already liked by this user' },
        { status: 409 }
      )
    }

    if (error.message?.includes('not found')) {
      return NextResponse.json(
        { error: 'Action not possible - item not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to process model action',
      message: 'An error occurred while processing your request',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })

  } finally {
    await prisma.$disconnect()
  }
}

// Handle preflight requests for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}