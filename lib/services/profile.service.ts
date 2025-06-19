// lib/services/profile.service.ts
import { prisma } from '@/lib/prisma'
import { UpdateProfileInput } from '@/lib/validations/profile'

export class ProfileService {
  /**
   * Get user profile with statistics
   */
  static async getUserProfile(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          displayName: true,
          username: true,
          email: true,
          bio: true,
          avatarUrl: true,
          coverImageUrl: true, // Now this field exists
          region: true,
          gender: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true
          // Remove _count for now since it's complex
        }
      })

      if (!user) return null

      // Get statistics separately with error handling
      let modelCount = 0
      let totalLikes = 0
      let totalDownloads = 0
      let totalViews = 0
      let followerCount = 0
      let followingCount = 0

      try {
        // Check if Model table exists first
        const modelStats = await prisma.model.aggregate({
          where: {
            authorId: userId,
            status: 'published'
          },
          _sum: {
            likes: true,
            downloads: true,
            views: true
          },
          _count: {
            id: true
          }
        }).catch(() => ({
          _sum: { likes: 0, downloads: 0, views: 0 },
          _count: { id: 0 }
        }))

        modelCount = modelStats._count?.id || 0
        totalLikes = modelStats._sum?.likes || 0
        totalDownloads = modelStats._sum?.downloads || 0
        totalViews = modelStats._sum?.views || 0
      } catch (error) {
        console.log('⚠️ Model table not available, using default stats')
      }

      return {
        id: user.id,
        displayName: user.displayName,
        username: user.username,
        email: user.email,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        coverImageUrl: user.coverImageUrl,
        region: user.region,
        gender: user.gender,
        emailVerified: user.emailVerified,
        memberSince: user.createdAt,
        lastActive: user.updatedAt,
        stats: {
          totalModels: modelCount,
          totalLikes: totalLikes,
          totalDownloads: totalDownloads,
          totalViews: totalViews,
          followers: followerCount,
          following: followingCount
        }
      }
    } catch (error) {
      console.error('Get user profile error:', error)
      throw error
    }
  }

  /**
   * Update user profile information
   */
  static async updateUserProfile(userId: string, data: UpdateProfileInput) {
    try {
      // Check uniqueness constraints
      if (data.username) {
        const existingUser = await prisma.user.findFirst({
          where: {
            username: data.username,
            NOT: { id: userId }
          }
        })
        if (existingUser) {
          throw new Error('Username already exists')
        }
      }

      if (data.email) {
        const existingUser = await prisma.user.findFirst({
          where: {
            email: data.email,
            NOT: { id: userId }
          }
        })
        if (existingUser) {
          throw new Error('Email already exists')
        }
      }

      // Update user profile
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          ...data,
          updatedAt: new Date()
        },
        select: {
          id: true,
          displayName: true,
          username: true,
          email: true,
          bio: true,
          avatarUrl: true,
          coverImageUrl: true,
          region: true,
          gender: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true
        }
      })

      return updatedUser
    } catch (error) {
      console.error('Update user profile error:', error)
      throw error
    }
  }

  /**
   * Get user models with filtering and pagination
   */
  static async getUserModels(userId: string, options: {
    status?: 'published' | 'verification' | 'rejected' | null
    page: number
    limit: number
    sortBy: string
    includePrivate: boolean
  }) {
    try {
      const { status, page, limit, sortBy, includePrivate } = options
      const skip = (page - 1) * limit

      // Build where clause
      const whereClause: any = {
        authorId: userId
      }

      if (status) {
        whereClause.status = status
      } else if (!includePrivate) {
        whereClause.status = 'published'
      }

      // Build order clause
      let orderBy: any = {}
      switch (sortBy) {
        case 'popular':
          orderBy = { likes: 'desc' }
          break
        case 'downloads':
          orderBy = { downloads: 'desc' }
          break
        case 'alphabetical':
          orderBy = { title: 'asc' }
          break
        case 'recent':
        default:
          orderBy = { createdAt: 'desc' }
      }

      // Get models with pagination
      const [models, total] = await Promise.all([
        prisma.model.findMany({
          where: whereClause,
          orderBy,
          skip,
          take: limit,
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            tags: true,
            thumbnailUrl: true,
            likes: true,
            downloads: true,
            views: true,
            status: true,
            createdAt: true,
            publishedAt: true,
            rejectionReason: true,
            adminNotes: true
          }
        }),
        prisma.model.count({ where: whereClause })
      ])

      // Get status statistics
      const stats = await prisma.model.groupBy({
        by: ['status'],
        where: { authorId: userId },
        _count: { status: true }
      })

      const statusStats = stats.reduce((acc, stat) => {
        acc[stat.status] = stat._count.status
        return acc
      }, {} as Record<string, number>)

      return {
        models,
        total,
        stats: {
          published: statusStats.published || 0,
          verification: statusStats.verification || 0,
          rejected: statusStats.rejected || 0,
          draft: statusStats.draft || 0
        }
      }
    } catch (error) {
      console.error('Get user models error:', error)
      throw error
    }
  }

  /**
   * Update user avatar
   */
  static async updateUserAvatar(userId: string, avatarUrl: string) {
    try {
      return await prisma.user.update({
        where: { id: userId },
        data: {
          avatarUrl,
          updatedAt: new Date()
        },
        select: {
          id: true,
          avatarUrl: true
        }
      })
    } catch (error) {
      console.error('Update user avatar error:', error)
      throw error
    }
  }

  /**
   * Remove user avatar
   */
  static async removeUserAvatar(userId: string) {
    try {
      return await prisma.user.update({
        where: { id: userId },
        data: {
          avatarUrl: null,
          updatedAt: new Date()
        }
      })
    } catch (error) {
      console.error('Remove user avatar error:', error)
      throw error
    }
  }

  /**
   * Follow/Unfollow user
   */
  static async toggleFollow(followerId: string, followingId: string) {
    try {
      if (followerId === followingId) {
        throw new Error('Cannot follow yourself')
      }

      // Check if already following
      const existingFollow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId,
            followingId
          }
        }
      })

      if (existingFollow) {
        // Unfollow
        await prisma.follow.delete({
          where: {
            followerId_followingId: {
              followerId,
              followingId
            }
          }
        })
        return { isFollowing: false, message: 'User unfollowed successfully' }
      } else {
        // Follow
        await prisma.follow.create({
          data: {
            followerId,
            followingId
          }
        })
        return { isFollowing: true, message: 'User followed successfully' }
      }
    } catch (error) {
      console.error('Toggle follow error:', error)
      throw error
    }
  }

  /**
   * Check if user is following another user
   */
  static async isFollowing(followerId: string, followingId: string) {
    try {
      const follow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId,
            followingId
          }
        }
      })
      return !!follow
    } catch (error) {
      console.error('Check following error:', error)
      throw error
    }
  }
}