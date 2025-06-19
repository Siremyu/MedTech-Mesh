// app/api/settings/check-availability/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { SettingsService } from '@/lib/services/settings.service'
import { z } from 'zod'

const checkAvailabilitySchema = z.object({
  field: z.enum(['username', 'email']),
  value: z.string().min(1, 'Value is required'),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { field, value } = checkAvailabilitySchema.parse(body)

    let isAvailable = false

    if (field === 'username') {
      isAvailable = await SettingsService.isUsernameAvailable(value, session.user.id)
    } else if (field === 'email') {
      isAvailable = await SettingsService.isEmailAvailable(value, session.user.id)
    }

    return NextResponse.json({
      available: isAvailable,
      message: isAvailable 
        ? `${field} is available` 
        : `${field} is already taken`
    })

  } catch (error: any) {
    console.error('Check availability error:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}