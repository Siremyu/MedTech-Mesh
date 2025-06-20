// app/api/profile/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Mendefinisikan tipe untuk kejelasan dan memperbaiki galat 'any' implisit
interface UserModelStats {
  id: string;
  status: string;
  likes: number | null;
  downloads: number | null;
}

interface UserForFilter {
  id: string;
  email: string | null;
  username: string | null;
}


export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Profile API called')
    
    const { searchParams } = new URL(request.url)
    const requestedUserId = searchParams.get('userId')
    
    console.log('📝 Requested User ID:', requestedUserId)
    
    // Get current session
    const session = await getServerSession(authOptions)
    console.log('🏠 Current session:', {
      exists: !!session,
      userId: session?.user?.id,
      email: session?.user?.email
    })
    
    // Determine which user profile to fetch
    let targetUserId: string
    let isOwner = false
    
    if (requestedUserId) {
      // Viewing someone else's profile or specific profile
      targetUserId = requestedUserId
      isOwner = session?.user?.id === requestedUserId
    } else {
      // Viewing own profile - require authentication
      if (!session?.user?.id) {
        console.log('❌ No session found for own profile request')
        return NextResponse.json({
          success: false,
          error: 'Authentication required to view your profile'
        }, { status: 401 })
      }
      targetUserId = session.user.id
      isOwner = true
    }
    
    console.log('🎯 Target User ID:', targetUserId)
    console.log('👤 Is Owner:', isOwner)
    
    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: {
        models: {
          select: {
            id: true,
            status: true,
            likes: true,
            downloads: true,
          }
        }
      }
    })
    
    if (!user) {
      console.log('❌ User not found in database:', targetUserId)
      
      // Check if similar users exist for debugging
      const allUsers = await prisma.user.findMany({
        select: { id: true, email: true, username: true },
        take: 5
      })
      
      console.log('🔍 Available users in database:', allUsers)
      
      return NextResponse.json({
        success: false,
        error: 'User profile not found',
        debugInfo: {
          requestedUserId: targetUserId,
          sessionUserId: session?.user?.id,
          totalUsersInDb: allUsers.length,
          similarUsersCount: allUsers.filter((u: UserForFilter) =>
            u.email?.includes(targetUserId) || 
            u.username?.includes(targetUserId) || 
            u.id.includes(targetUserId)
          ).length
        }
      }, { status: 404 })
    }
    
    console.log('✅ User found:', {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      modelsCount: user.models.length
    })
    
    // Calculate statistics
    const stats = {
      totalModels: user.models.length,
      publishedModels: user.models.filter((m: UserModelStats) => m.status === 'published').length,
      pendingModels: user.models.filter((m: UserModelStats) => m.status === 'verification').length,
      rejectedModels: user.models.filter((m: UserModelStats) => m.status === 'rejected').length,
      totalLikes: user.models.reduce((sum: number, model: UserModelStats) => sum + (model.likes || 0), 0),
      totalDownloads: user.models.reduce((sum: number, model: UserModelStats) => sum + (model.downloads || 0), 0),
      followers: 0, // TODO: Implement followers system
      following: 0, // TODO: Implement following system
    }
    
    // Prepare profile response
    const profileResponse = {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      gender: user.gender,
      region: user.region,
      emailVerified: user.emailVerified,
      memberSince: user.createdAt,
      lastUpdated: user.updatedAt,
      stats
    }
    
    console.log('✅ Profile response prepared')
    
    return NextResponse.json({
      success: true,
      profile: profileResponse,
      isOwner
    })
    
  } catch (error) {
    console.error('❌ Profile API error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: errorMessage
    }, { status: 500 })
  }
}

// Add PATCH method for profile updates
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 })
    }
    
    const body = await request.json()
    
    // Validate and update user profile
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        displayName: body.displayName,
        username: body.username,
        bio: body.bio,
        gender: body.gender,
        region: body.region,
      },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
        gender: true,
        region: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      }
    })
    
    return NextResponse.json({
      success: true,
      userSettings: updatedUser
    })
    
  } catch (error) {
    console.error('❌ Profile update error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update profile'
    }, { status: 500 })
  }
}