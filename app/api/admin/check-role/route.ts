import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * Admin Role Check API - /app/api/admin/check-role/route.ts
 * Verifies if the current user has admin privileges
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { isAdmin: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Check user role in database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, email: true }
    })

    if (!user) {
      return NextResponse.json(
        { isAdmin: false, error: 'User not found' },
        { status: 404 }
      )
    }

    const isAdmin = user.role === 'ADMIN'

    return NextResponse.json({
      isAdmin,
      userRole: user.role,
      email: user.email
    })

  } catch (error: any) {
    console.error('❌ Admin role check error:', error)
    
    return NextResponse.json({
      isAdmin: false,
      error: 'Failed to check admin status',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}

// Related models
relatedModels: relatedModels.map((related: {
  id: string;
  title: string;
  coverImageUrl: string | null;
  likes: number;
  downloads: number;
  views: number;
  author: {
    id: string;
    displayName: string | null;
  };
}) => ({
  id: related.id,
  title: related.title,
  thumbnailUrl: related.coverImageUrl,
  likes: related.likes,
  downloads: related.downloads,
  views: related.views,
  author: {
    id: related.author.id || 'unknown',
    name: related.author.displayName || 'Anonymous User'
  }
}))