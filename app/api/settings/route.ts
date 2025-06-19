import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

// Validation schema
const updateSettingsSchema = z.object({
  displayName: z.string().min(2).max(50).optional(),
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/).optional(),
  email: z.string().email().optional(),
  bio: z.string().max(500).optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer-not-to-say']).optional(),
  region: z.string().max(100).optional(),
})

export async function GET() {
  console.log('🔍 Settings API GET called')
  
  try {
    const session = await getServerSession(authOptions)
    console.log('Session in API:', !!session, session?.user?.email)
    
    if (!session?.user) {
      console.log('❌ No session in settings API')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('👤 Fetching user from database:', session.user.id)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        displayName: true,
        username: true,
        email: true,
        bio: true,
        avatarUrl: true,
        gender: true,
        region: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      console.log('❌ User not found in database')
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    console.log('✅ User found, returning settings')
    return NextResponse.json({
      userSettings: {
        displayName: user.displayName || '',
        username: user.username || '',
        email: user.email || '',
        bio: user.bio || '',
        avatarUrl: user.avatarUrl || null,
        gender: user.gender || '',
        region: user.region || '',
        emailVerified: user.emailVerified,
        memberSince: user.createdAt,
        lastUpdated: user.updatedAt,
      }
    })

  } catch (error) {
    console.error('❌ Settings API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateSettingsSchema.parse(body)

    // Check uniqueness constraints
    if (validatedData.username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username: validatedData.username,
          NOT: { id: session.user.id }
        }
      })
      if (existingUser) {
        return NextResponse.json({ error: 'Username is already taken' }, { status: 400 })
      }
    }

    if (validatedData.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: validatedData.email,
          NOT: { id: session.user.id }
        }
      })
      if (existingUser) {
        return NextResponse.json({ error: 'Email is already taken' }, { status: 400 })
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...validatedData,
        updatedAt: new Date(),
      },
      select: {
        displayName: true,
        username: true,
        email: true,
        bio: true,
        avatarUrl: true,
        gender: true,
        region: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({
      message: 'Settings updated successfully',
      userSettings: updatedUser
    })

  } catch (error: any) {
    console.error('Update settings error:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: error.errors 
      }, { status: 400 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}