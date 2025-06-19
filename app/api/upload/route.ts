// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { put } from '@vercel/blob'

export async function POST(request: NextRequest) {
  console.log('🚀 Upload API - Start processing')

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

    // Check if Vercel Blob token is configured
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('❌ Upload API - BLOB_READ_WRITE_TOKEN not configured')
      return NextResponse.json(
        { error: 'Server configuration error - Blob storage not configured' },
        { status: 500 }
      )
    }

    // Parse form data
    const formData = await request.formData()
    const files: File[] = []
    const category = formData.get('category') as string || 'model'

    // Extract files from form data
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('file') && value instanceof File) {
        files.push(value)
      }
    }

    console.log(`📁 Upload API - Processing ${files.length} files`)

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }

    // Process each file
    const uploadResults = []
    
    for (const file of files) {
      try {
        console.log(`📤 Uploading file: ${file.name} (${file.size} bytes)`)

        // Validate file size (50MB limit)
        if (file.size > 50 * 1024 * 1024) {
          throw new Error(`File ${file.name} exceeds 50MB limit`)
        }

        // Convert File to Buffer
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Generate unique filename
        const timestamp = Date.now()
        const fileExtension = file.name.split('.').pop()
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
        const uniqueFileName = `${timestamp}-${sanitizedName}`
        const filePath = `${category}/${uniqueFileName}`

        // Upload to Vercel Blob
        const blob = await put(filePath, buffer, {
          access: 'public',
          contentType: file.type || 'application/octet-stream',
        })

        console.log(`✅ File uploaded successfully: ${blob.url}`)

        uploadResults.push({
          originalName: file.name,
          fileName: uniqueFileName,
          url: blob.url,
          size: file.size,
          type: file.type,
          mimeType: file.type,
          uploadedAt: new Date().toISOString(),
          uploadedBy: session.user.id
        })

      } catch (fileError: any) {
        console.error(`❌ Failed to upload ${file.name}:`, fileError)
        throw new Error(`Failed to upload ${file.name}: ${fileError.message}`)
      }
    }

    console.log(`✅ Upload API - All files uploaded successfully: ${uploadResults.length}`)

    return NextResponse.json({
      success: true,
      message: `Successfully uploaded ${uploadResults.length} files`,
      files: uploadResults,
      metadata: {
        category,
        uploadedBy: session.user.id,
        uploadedAt: new Date().toISOString()
      }
    })

  } catch (error: any) {
    console.error('❌ Upload API - Critical Error:', error)
    console.error('Error stack:', error.stack)

    // Return appropriate error response
    if (error.message?.includes('exceeds')) {
      return NextResponse.json(
        { error: error.message },
        { status: 413 }
      )
    }

    if (error.message?.includes('Authentication')) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Upload failed',
        details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
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