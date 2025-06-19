// app/api/models/create/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { z } from 'zod'

// Validation schema
const createModelSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  tags: z.string().optional(),
  visibility: z.enum(['public', 'private']).default('public'),
  nsfwContent: z.string().transform(val => val === 'true').default('false'),
  allowAdaptations: z.enum(['yes', 'no', 'share-alike']).default('yes'),
  allowCommercialUse: z.enum(['yes', 'no']).default('no'),
  allowSharing: z.enum(['yes', 'no']).default('yes'),
  communityPost: z.string().transform(val => val === 'true').default('true')
})

async function saveFile(file: File, directory: string, filename?: string): Promise<string> {
  try {
    // Fix: Better file validation
    if (!file) {
      throw new Error('File is null or undefined')
    }
    
    if (!file.name) {
      throw new Error('File has no name')
    }
    
    if (file.size === 0) {
      throw new Error(`File "${file.name}" is empty`)
    }

    // Fix: Better arrayBuffer handling
    let bytes: ArrayBuffer
    try {
      bytes = await file.arrayBuffer()
    } catch (bufferError) {
      throw new Error(`Failed to read file "${file.name}": ${bufferError}`)
    }

    if (bytes.byteLength === 0) {
      throw new Error(`File "${file.name}" contains no data`)
    }

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
    
    console.log(`✅ File saved: ${file.name} (${file.size} bytes) -> ${publicUrl}`)
    return publicUrl

  } catch (error) {
    console.error(`❌ Error saving file:`, error)
    throw new Error(`Failed to save file "${file?.name || 'unknown'}": ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Create model API called')
    
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 })
    }

    // Parse form data
    let formData: FormData
    try {
      formData = await request.formData()
    } catch (parseError) {
      console.error('❌ Failed to parse FormData:', parseError)
      return NextResponse.json({
        success: false,
        error: 'Invalid form data'
      }, { status: 400 })
    }
    
    // Extract and validate model data
    const modelData = {
      title: formData.get('title') as string,
      category: formData.get('category') as string,
      description: formData.get('description') as string,
      tags: formData.get('tags') as string,
      visibility: formData.get('visibility') as string,
      nsfwContent: formData.get('nsfwContent') as string,
      allowAdaptations: formData.get('allowAdaptations') as string,
      allowCommercialUse: formData.get('allowCommercialUse') as string,
      allowSharing: formData.get('allowSharing') as string,
      communityPost: formData.get('communityPost') as string,
    }

    console.log('📋 Received model data:', modelData)

    // Validate model data
    const validationResult = createModelSchema.safeParse(modelData)
    if (!validationResult.success) {
      console.log('❌ Validation failed:', validationResult.error.errors)
      return NextResponse.json({
        success: false,
        error: 'Invalid form data',
        details: validationResult.error.errors
      }, { status: 400 })
    }

    const validatedData = validationResult.data

    // Process files
    const coverImage = formData.get('coverImage') as File | null
    const galleryImages = formData.getAll('galleryImages') as File[]
    const modelFile = formData.get('modelFile') as File | null

    // Fix: Log detailed file information
    console.log('📁 Files received:', {
      coverImage: coverImage ? { 
        name: coverImage.name, 
        size: coverImage.size, 
        type: coverImage.type,
        isEmpty: coverImage.size === 0 
      } : null,
      galleryImages: galleryImages.map(img => ({ 
        name: img.name, 
        size: img.size, 
        type: img.type,
        isEmpty: img.size === 0 
      })),
      modelFile: modelFile ? { 
        name: modelFile.name, 
        size: modelFile.size, 
        type: modelFile.type,
        isEmpty: modelFile.size === 0 
      } : null
    })

    // Fix: Validate files before processing
    const allFiles = [
      ...(coverImage ? [{ file: coverImage, type: 'cover' }] : []),
      ...galleryImages.map(img => ({ file: img, type: 'gallery' })),
      ...(modelFile ? [{ file: modelFile, type: 'model' }] : [])
    ]

    // Check for empty files
    const emptyFiles = allFiles.filter(({ file }) => file.size === 0)
    if (emptyFiles.length > 0) {
      const emptyFileNames = emptyFiles.map(({ file }) => file.name).join(', ')
      return NextResponse.json({
        success: false,
        error: `The following files are empty: ${emptyFileNames}`,
        details: `Please re-upload these files: ${emptyFileNames}`
      }, { status: 400 })
    }

    // Validate that at least one file is provided
    if (allFiles.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'At least one file (cover image, gallery image, or model file) is required'
      }, { status: 400 })
    }

    // Fix: Better file saving with error handling
    let coverImageUrl: string | null = null
    let modelFileUrl: string | null = null
    const galleryImageUrls: string[] = []

    try {
      // Save cover image
      if (coverImage && coverImage.size > 0) {
        console.log('💾 Saving cover image...')
        coverImageUrl = await saveFile(coverImage, 'covers')
      }

      // Save gallery images
      for (const image of galleryImages) {
        if (image && image.size > 0) {
          console.log('💾 Saving gallery image:', image.name)
          const url = await saveFile(image, 'gallery')
          galleryImageUrls.push(url)
        }
      }

      // Save model file
      if (modelFile && modelFile.size > 0) {
        console.log('💾 Saving model file...')
        modelFileUrl = await saveFile(modelFile, 'models')
      }

    } catch (fileError) {
      console.error('❌ File saving failed:', fileError)
      return NextResponse.json({
        success: false,
        error: 'Failed to save files',
        details: fileError instanceof Error ? fileError.message : 'Unknown file error'
      }, { status: 500 })
    }

    // Process tags
    const tagsArray = validatedData.tags 
      ? validatedData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
      : []

    // Create model in database
    try {
      console.log('💾 Creating model in database...')
      
      const newModel = await prisma.model.create({
        data: {
          title: validatedData.title,
          description: validatedData.description,
          category: validatedData.category,
          tags: tagsArray,
          coverImageUrl,
          modelFileUrl,
          galleryImages: galleryImageUrls,
          status: 'published',
          visibility: validatedData.visibility,
          nsfwContent: validatedData.nsfwContent,
          license: {
            type: 'custom',
            allowCommercialUse: validatedData.allowCommercialUse === 'yes',
            allowSharing: validatedData.allowSharing === 'yes',
            allowAdaptations: validatedData.allowAdaptations === 'yes'
          },
          authorId: session.user.id,
          publishedAt: new Date(),
          likes: 0,
          downloads: 0,
          views: 0
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

      console.log('✅ Model created successfully:', newModel.id)

      return NextResponse.json({
        success: true,
        message: 'Model published successfully',
        data: {
          id: newModel.id,
          title: newModel.title,
          slug: newModel.id, // You can implement slug generation if needed
          url: `/product?id=${newModel.id}`
        }
      })

    } catch (dbError) {
      console.error('❌ Database error:', dbError)
      return NextResponse.json({
        success: false,
        error: 'Failed to save model to database',
        details: dbError instanceof Error ? dbError.message : 'Database error'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('❌ Unexpected error in create model API:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}