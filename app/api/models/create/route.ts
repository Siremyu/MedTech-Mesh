// app/api/models/create/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

// Validation schema
const createModelSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(2000),
  category: z.string().min(1),
  tags: z.string().optional(),
  visibility: z.enum(['public', 'private']).default('public'),
  nsfwContent: z.string().transform(val => val === 'true').default('false'),
  allowAdaptations: z.enum(['yes', 'no']).default('yes'),
  allowCommercialUse: z.enum(['yes', 'no']).default('no'),
  allowSharing: z.enum(['yes', 'no']).default('yes'),
  communityPost: z.string().transform(val => val === 'true').default('true')
})

async function saveFile(file: File, directory: string, filename?: string): Promise<string> {
  try {
    // Validate file
    if (!file || file.size === 0) {
      throw new Error(`File "${file?.name || 'unknown'}" is empty or invalid`)
    }

    // Read file data
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create upload directory
    const uploadDir = join(process.cwd(), 'public', 'uploads', directory)
    await mkdir(uploadDir, { recursive: true })

    // Generate filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const extension = file.name.split('.').pop()
    const savedFilename = filename || `${timestamp}-${randomString}.${extension}`
    
    const filepath = join(uploadDir, savedFilename)
    
    // Save file
    await writeFile(filepath, buffer)
    
    const publicUrl = `/uploads/${directory}/${savedFilename}`
    console.log(`✅ File saved: ${file.name} -> ${publicUrl}`)
    return publicUrl

  } catch (error) {
    console.error(`❌ Error saving file:`, error)
    throw new Error(`Failed to save file "${file?.name || 'unknown'}": ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Create Model API Route - /app/api/models/create/route.ts
 * Handles model creation with file uploads
 */
export async function POST(request: NextRequest) {
  console.log('🚀 Create model API - Starting...')

  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      console.log('❌ Authentication required')
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 })
    }

    console.log('✅ User authenticated:', session.user.email)

    // Parse form data
    let formData: FormData
    try {
      formData = await request.formData()
      console.log('✅ Form data parsed successfully')
    } catch (parseError) {
      console.error('❌ Failed to parse FormData:', parseError)
      return NextResponse.json({
        success: false,
        error: 'Invalid form data - could not parse request'
      }, { status: 400 })
    }
    
    // Extract model data
    const modelData = {
      title: formData.get('title') as string,
      category: formData.get('category') as string,
      description: formData.get('description') as string,
      tags: formData.get('tags') as string || '',
      visibility: formData.get('visibility') as string || 'public',
      nsfwContent: formData.get('nsfwContent') as string || 'false',
      allowAdaptations: formData.get('allowAdaptations') as string || 'yes',
      allowCommercialUse: formData.get('allowCommercialUse') as string || 'no',
      allowSharing: formData.get('allowSharing') as string || 'yes',
      communityPost: formData.get('communityPost') as string || 'true',
    }

    console.log('📋 Extracted model data:', {
      title: modelData.title,
      category: modelData.category,
      hasDescription: !!modelData.description,
      visibility: modelData.visibility
    })

    // Validate model data
    let validatedData
    try {
      validatedData = createModelSchema.parse(modelData)
      console.log('✅ Model data validation passed')
    } catch (validationError) {
      console.log('❌ Model data validation failed:', validationError)
      if (validationError instanceof z.ZodError) {
        return NextResponse.json({
          success: false,
          error: 'Validation failed',
          details: validationError.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        }, { status: 400 })
      }
      throw validationError
    }

    // Extract files
    const coverImage = formData.get('coverImage') as File | null
    const galleryImages = formData.getAll('galleryImages') as File[]
    const modelFile = formData.get('modelFile') as File | null

    console.log('📁 Files received:', {
      coverImage: coverImage ? { name: coverImage.name, size: coverImage.size } : null,
      galleryCount: galleryImages.length,
      modelFile: modelFile ? { name: modelFile.name, size: modelFile.size } : null
    })

    // Validate that at least one file is provided
    const hasFiles = (coverImage && coverImage.size > 0) || 
                    galleryImages.some(img => img.size > 0) || 
                    (modelFile && modelFile.size > 0)

    if (!hasFiles) {
      return NextResponse.json({
        success: false,
        error: 'At least one file (cover image, gallery image, or model file) is required'
      }, { status: 400 })
    }

    // Check for empty files
    const allFiles = [
      ...(coverImage ? [{ file: coverImage, type: 'cover' }] : []),
      ...galleryImages.map(img => ({ file: img, type: 'gallery' })),
      ...(modelFile ? [{ file: modelFile, type: 'model' }] : [])
    ]

    const emptyFiles = allFiles.filter(({ file }) => file.size === 0)
    if (emptyFiles.length > 0) {
      const emptyFileNames = emptyFiles.map(({ file }) => file.name).join(', ')
      return NextResponse.json({
        success: false,
        error: `The following files are empty: ${emptyFileNames}`
      }, { status: 400 })
    }

    // Save files
    let coverImageUrl: string | null = null
    let modelFileUrl: string | null = null
    const galleryImageUrls: string[] = []

    try {
      console.log('💾 Starting file uploads...')

      // Save cover image
      if (coverImage && coverImage.size > 0) {
        console.log('📸 Saving cover image...')
        coverImageUrl = await saveFile(coverImage, 'covers')
      }

      // Save gallery images
      for (let i = 0; i < galleryImages.length; i++) {
        const image = galleryImages[i]
        if (image && image.size > 0) {
          console.log(`🖼️ Saving gallery image ${i + 1}/${galleryImages.length}...`)
          const url = await saveFile(image, 'gallery')
          galleryImageUrls.push(url)
        }
      }

      // Save model file
      if (modelFile && modelFile.size > 0) {
        console.log('🎯 Saving model file...')
        modelFileUrl = await saveFile(modelFile, 'models')
      }

      console.log('✅ All files saved successfully')

    } catch (fileError) {
      console.error('❌ File saving failed:', fileError)
      return NextResponse.json({
        success: false,
        error: 'Failed to save uploaded files',
        details: fileError instanceof Error ? fileError.message : 'Unknown file error'
      }, { status: 500 })
    }

    // Process tags
    const tagsArray = validatedData.tags 
      ? validatedData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
      : []

    // Connect to database
    try {
      await prisma.$connect()
      console.log('✅ Database connected')
    } catch (dbConnectError) {
      console.error('❌ Database connection failed:', dbConnectError)
      return NextResponse.json({
        success: false,
        error: 'Database connection failed'
      }, { status: 500 })
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      console.log('❌ User not found in database')
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 })
    }

    // Create model in database
    let newModel
    try {
      console.log('💾 Creating model in database...')
      
      newModel = await prisma.model.create({
        data: {
          title: validatedData.title,
          description: validatedData.description,
          category: validatedData.category,
          tags: tagsArray,
          coverImageUrl,
          modelFileUrl,
          galleryImages: galleryImageUrls,
          status: 'verification', // Always start with verification for admin review
          visibility: validatedData.visibility,
          nsfwContent: validatedData.nsfwContent,
          license: JSON.stringify({
            allowAdaptations: validatedData.allowAdaptations === 'yes',
            allowCommercialUse: validatedData.allowCommercialUse === 'yes',
            allowSharing: validatedData.allowSharing === 'yes'
          }),
          communityPost: validatedData.communityPost,
          authorId: session.user.id,
          likes: 0,
          downloads: 0,
          views: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          publishedAt: null, // Will be set when admin approves
          rejectionReason: null,
          adminNotes: null
        },
        include: {
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

      console.log('✅ Model created successfully:', {
        id: newModel.id,
        title: newModel.title,
        status: newModel.status
      })

    } catch (dbError: any) {
      console.error('❌ Database model creation failed:', dbError)
      
      // Handle specific database errors
      if (dbError.code === 'P2002') {
        return NextResponse.json({
          success: false,
          error: 'A model with this title already exists'
        }, { status: 409 })
      }
      
      if (dbError.code === 'P2003') {
        return NextResponse.json({
          success: false,
          error: 'Referenced user does not exist'
        }, { status: 400 })
      }

      return NextResponse.json({
        success: false,
        error: 'Failed to save model to database',
        details: process.env.NODE_ENV === 'development' ? dbError.message : 'Database error'
      }, { status: 500 })
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Model submitted successfully and is pending admin review',
      data: {
        id: newModel.id,
        title: newModel.title,
        status: newModel.status,
        url: `/profile?userId=${session.user.id}`,
        message: 'Your model has been submitted for review. You can track its status in your profile.'
      }
    })

  } catch (error: any) {
    console.error('❌ Unexpected error in create model API:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}