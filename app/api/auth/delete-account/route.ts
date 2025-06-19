// app/api/auth/delete-account/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Delete user and all related data in transaction
    await prisma.$transaction(async (tx) => {
      // Delete in correct order to respect foreign key constraints
      await tx.like.deleteMany({ where: { userId } })
      await tx.download.deleteMany({ where: { userId } })
      await tx.collection.deleteMany({ where: { userId } })
      await tx.model.deleteMany({ where: { authorId: userId } })
      await tx.session.deleteMany({ where: { userId } })
      await tx.account.deleteMany({ where: { userId } })
      await tx.user.delete({ where: { id: userId } })
    })

    // Clear auth cookie
    const response = NextResponse.json({ message: 'Account deleted successfully' })
    response.cookies.set('next-auth.session-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    })

    return response

  } catch (error) {
    console.error('Delete account error:', error)
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
  }
}