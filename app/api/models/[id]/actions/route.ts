// app/api/models/[id]/actions/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

// Validation schema untuk actions
const actionSchema = z.object({
  action: z.enum(['like', 'unlike', 'download']),
  metadata: z.object({
    userAgent: z.string().optional(),
    timestamp: z.string().optional(),
    source: z.string().optional() // e.g., 'product_page', 'home_feed'
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
  console.log('⚡ Model Actions API - Starting request')
  
  try {
    const modelId = params.id
    const session = await getServerSession(authOptions)
    
    // Authentication required untuk semua actions
    if (!session?.user?.id) {
      console.log('❌ Authentication required for model actions')
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    // Validate request body
    const body = await request.json()
    const validation = actionSchema.safeParse(body)
    
    if (!validation.success) {
      console.log('❌ Invalid request data:', validation.error.errors)
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      )
    }
    
    const { action, metadata } = validation.data
    const userId = session.user.id
    
    console.log(`🎯 Processing ${action} for model: ${modelId} by user: ${userId}`)
    
    await prisma.$connect()
    
    // Check if model exists dan published
    const model = await prisma.model.findUnique({
      where: { id: modelId },
      select: { 
        id: true, 
        title: true,
        status: true, 
        visibility: true,
        authorId: true,
        likes: true,
        downloads: true 
      }
    })
    
    if (!model) {
      console.log('❌ Model not found:', modelId)
      return NextResponse.json(
        { error: 'Model not found' },
        { status: 404 }
      )
    }
    
    // Check if model is available untuk interaction
    if (model.status !== 'published' || model.visibility !== 'public') {
      console.log('❌ Model not available for interaction:', model.status, model.visibility)
      return NextResponse.json(
        { error: 'Model is not available for interaction' },
        { status: 403 }
      )
    }
    
    // Prevent self-interaction untuk likes
    if ((action === 'like' || action === 'unlike') && model.authorId === userId) {
      console.log('❌ Self-like prevention for user:', userId)
      return NextResponse.json(
        { error: 'You cannot like your own model' },
        { status: 403 }
      )
    }
    
    let result: any = {}
    
    // Process action using transaction untuk data consistency
    await prisma.$transaction(async (tx) => {
      switch (action) {
        case 'like':
          console.log('❤️ Processing like action...')
          
          // Check if already liked
          const existingLike = await tx.like.findUnique({
            where: {
              userId_modelId: {
                userId,
                modelId
              }
            }
          })
          
          if (existingLike) {
            throw new Error('Model already liked by this user')
          }
          
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
          break
          
        case 'unlike':
          console.log('💔 Processing unlike action...')
          
          // Check if like exists
          const likeToRemove = await tx.like.findUnique({
            where: {
              userId_modelId: {
                userId,
                modelId
              }
            }
          })
          
          if (!likeToRemove) {
            throw new Error('Like not found - cannot unlike')
          }
          
          // Remove like record
          await tx.like.delete({
            where: {
              userId_modelId: {
                userId,
                modelId
              }
            }
          })
          
          // Decrement model likes count (prevent negative)
          const currentModel = await tx.model.findUnique({
            where: { id: modelId },
            select: { likes: true }
          })
          
          const updatedModelUnlike = await tx.model.update({
            where: { id: modelId },
            data: { 
              likes: Math.max(0, (currentModel?.likes || 1) - 1),
              updatedAt: new Date()
            },
            select: { likes: true }
          })
          
          result = {
            action: 'unlike',
            modelId,
            newLikesCount: updatedModelUnlike.likes,
            liked: false,
            message: 'Like removed successfully'
          }
          
          console.log('✅ Like removed successfully, new count:', updatedModelUnlike.likes)
          break
          
        case 'download':
          console.log('⬇️ Processing download action...')
          
          // Check for recent download (prevent spam dalam 5 menit)
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
            const updatedModelDownload = await tx.model.update({
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
              newDownloadsCount: updatedModelDownload.downloads,
              downloaded: true,
              message: 'Download recorded successfully',
              downloadUrl: model.modelFileUrl || null // Add actual download URL if available
            }
            
            console.log('✅ Download recorded, new count:', updatedModelDownload.downloads)
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
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
    
  } finally {
    await prisma.$disconnect()
    console.log('🔌 Database disconnected')
  }
}