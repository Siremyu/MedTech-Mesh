// app/api/profile/follow/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ProfileService } from '@/lib/services/profile.service'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      )
    }

    const { targetUserId } = await request.json()
    
    if (!targetUserId) {
      return NextResponse.json(
        { error: 'Target user ID is required' },
        { status: 400 }
      )
    }

    const result = await ProfileService.toggleFollow(
      session.user.id,
      targetUserId
    )

    return NextResponse.json(result)

  } catch (error: any) {
    console.error('Follow toggle error:', error)
    
    if (error.message === 'Cannot follow yourself') {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const targetUserId = searchParams.get('targetUserId')
    
    if (!session?.user || !targetUserId) {
      return NextResponse.json({ isFollowing: false })
    }

    const isFollowing = await ProfileService.isFollowing(
      session.user.id,
      targetUserId
    )

    return NextResponse.json({ isFollowing })

  } catch (error) {
    console.error('Check following error:', error)
    return NextResponse.json({ isFollowing: false })
  }
}