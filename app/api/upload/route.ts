// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { CloudinaryService } from '@/lib/services/cloudinary.service'

/**
 * File Upload API using Cloudinary - /app/api/upload/route.ts
 */
export async function POST(request: NextRequest) {
  console.log('🚀 Upload API (Cloudinary) - Start processing')

  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      console.log('❌ Upload API - No authenticated user')
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    console.log('✅ Upload API - User authenticated:', session.user.email)

    // Parse form data
    const formData = await request.formData()
    const files: File[] = []
    const category = formData.get('category') as string || 'model'

    // Extract files from form data
    formData.forEach((value, key) => {
      if (key.startsWith('file') && value instanceof File) {
        files.push(value)
      }
    })

    console.log(`📁 Upload API - Processing ${files.length} files`)

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }

    // Upload files to Cloudinary
    const uploadResults = []
    
    for (const file of files) {
      try {
        console.log(`📤 Uploading: ${file.name}`)
        
        // Convert File to Buffer
        const buffer = Buffer.from(await file.arrayBuffer())
        
        // Determine file type and upload accordingly
        let result
        if (file.type.startsWith('image/')) {
          result = await CloudinaryService.uploadImage(buffer, file.name, {
            tags: [session.user.id, 'user-upload', category]
          })
        } else {
          // For 3D models and other files
          result = await CloudinaryService.uploadModel(buffer, file.name, {
            tags: [session.user.id, 'user-upload', category, '3d-model']
          })
        }
        
        uploadResults.push({
          originalName: file.name,
          fileName: result.publicId,
          url: result.url,
          secureUrl: result.secureUrl,
          publicId: result.publicId,
          size: result.bytes,
          type: file.type.startsWith('image/') ? 'image' : 'model',
          mimeType: file.type,
          uploadedAt: result.createdAt,
          uploadedBy: session.user.id,
          width: result.width,
          height: result.height
        })
        
        console.log(`✅ Successfully uploaded: ${file.name}`)
        
      } catch (error: any) {
        console.error(`❌ Failed to upload ${file.name}:`, error)
        throw new Error(`Failed to upload ${file.name}: ${error.message}`)
      }
    }

    console.log(`✅ Upload API - Successfully uploaded ${uploadResults.length} files`)

    return NextResponse.json({
      success: true,
      message: `Successfully uploaded ${uploadResults.length} files`,
      files: uploadResults,
      totalFiles: uploadResults.length
    })

  } catch (error: any) {
    console.error('❌ Upload API Error:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Upload failed',
      message: 'Failed to upload files to Cloudinary',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
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