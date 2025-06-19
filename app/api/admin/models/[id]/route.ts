// app/api/admin/models/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Admin endpoint to approve/reject models
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // TODO: Add admin role check here
    // if (session.user.role !== 'admin') {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    // }

    const body = await request.json()
    const { action, rejectionReason, adminNotes } = body // action: 'approve' | 'reject'

    const model = await prisma.model.findUnique({
      where: { id: params.id }
    })

    if (!model) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 })
    }

    const updatedModel = await prisma.model.update({
      where: { id: params.id },
      data: {
        status: action === 'approve' ? 'published' : 'rejected',
        publishedAt: action === 'approve' ? new Date() : null,
        rejectionReason: action === 'reject' ? rejectionReason : null,
        adminNotes: adminNotes || null,
        reviewedBy: session.user.id,
        reviewedAt: new Date(),
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: `Model ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      model: updatedModel
    })

  } catch (error: any) {
    console.error('Admin model update error:', error)
    return NextResponse.json(
      { error: 'Failed to update model status' },
      { status: 500 }
    )
  }
}