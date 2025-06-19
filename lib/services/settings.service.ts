// lib/services/settings.service.ts
import { prisma } from '@/lib/prisma'
import { UpdateSettingsInput } from '@/lib/validations/settings'

export class SettingsService {
  /**
   * Get user settings by user ID
   */
  static async getUserSettings(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
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
          _count: {
            select: {
              models: true,
              likes: true,
              downloads: true,
            }
          }
        },
      })

      if (!user) {
        throw new Error('User not found')
      }

      return {
        ...user,
        stats: {
          totalModels: user._count.models,
          totalLikes: user._count.likes,
          totalDownloads: user._count.downloads,
        }
      }
    } catch (error) {
      console.error('Get user settings error:', error)
      throw error
    }
  }

  /**
   * Update user settings
   */
  static async updateUserSettings(userId: string, data: UpdateSettingsInput) {
    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          ...data,
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

      return updatedUser
    } catch (error) {
      console.error('Update user settings error:', error)
      throw error
    }
  }

  /**
   * Check if username is available
   */
  static async isUsernameAvailable(username: string, excludeUserId?: string) {
    try {
      const existingUser = await prisma.user.findFirst({
        where: {
          username,
          ...(excludeUserId && { NOT: { id: excludeUserId } })
        }
      })

      return !existingUser
    } catch (error) {
      console.error('Check username availability error:', error)
      throw error
    }
  }

  /**
   * Check if email is available
   */
  static async isEmailAvailable(email: string, excludeUserId?: string) {
    try {
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          ...(excludeUserId && { NOT: { id: excludeUserId } })
        }
      })

      return !existingUser
    } catch (error) {
      console.error('Check email availability error:', error)
      throw error
    }
  }

  /**
   * Delete user account and all associated data
   */
  static async deleteUserAccount(userId: string) {
    try {
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

      return { success: true }
    } catch (error) {
      console.error('Delete user account error:', error)
      throw error
    }
  }
}