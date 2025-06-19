// app/api/profile/update/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ProfileService } from '@/lib/services/profile.service'
import { updateProfileSchema } from '@/lib/validations/profile'
import { rateLimit } from '@/lib/rate-limit'

// Rate limiting for profile updates
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
})

export async function PATCH(request: NextRequest) {
  try {
    // Apply rate limiting
    await limiter.check(request, 10) // Max 10 requests per minute

    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = updateProfileSchema.parse(body)

    // Update profile using service
    const updatedProfile = await ProfileService.updateUserProfile(
      session.user.id,
      validatedData
    )

    return NextResponse.json({
      message: 'Profile updated successfully',
      profile: updatedProfile
    })

  } catch (error: any) {
    console.error('Update profile error:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: error.errors.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      )
    }

    if (error.message.includes('already exists')) {
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