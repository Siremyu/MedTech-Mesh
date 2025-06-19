// app/api/profile/avatar/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ProfileService } from '@/lib/services/profile.service'
import { FileUploadService } from '@/lib/services/file-upload.service'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('avatar') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    const maxSize = 5 * 1024 * 1024 // 5MB

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' },
        { status: 400 }
      )
    }

    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum 5MB allowed.' },
        { status: 400 }
      )
    }

    // Upload file and get URL
    const avatarUrl = await FileUploadService.uploadAvatar(file, session.user.id)
    
    // Update user avatar in database
    const updatedProfile = await ProfileService.updateUserAvatar(
      session.user.id,
      avatarUrl
    )

    return NextResponse.json({
      message: 'Avatar updated successfully',
      avatarUrl: updatedProfile.avatarUrl
    })

  } catch (error) {
    console.error('Upload avatar error:', error)
    return NextResponse.json(
      { error: 'Failed to upload avatar' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      )
    }

    // Remove avatar from user profile
    await ProfileService.removeUserAvatar(session.user.id)

    return NextResponse.json({
      message: 'Avatar removed successfully'
    })

  } catch (error) {
    console.error('Remove avatar error:', error)
    return NextResponse.json(
      { error: 'Failed to remove avatar' },
      { status: 500 }
    )
  }
}