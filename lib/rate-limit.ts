// lib/rate-limit.ts
import { LRUCache } from 'lru-cache'
import { NextRequest } from 'next/server'

type Options = {
  uniqueTokenPerInterval?: number
  interval?: number
}

export function rateLimit(options: Options) {
  const tokenCache = new LRUCache({
    max: options.uniqueTokenPerInterval || 500,
    ttl: options.interval || 60000,
  })

  return {
    check: async (request: NextRequest, limit = 5) => {
      const token = getClientId(request)
      const tokenCount = (tokenCache.get(token) as number[]) || [0]
      
      if (tokenCount[0] === 0) {
        tokenCache.set(token, [1])
      } else {
        tokenCount[0] += 1
        tokenCache.set(token, tokenCount)
      }

      const currentUsage = tokenCount[0]
      const isRateLimited = currentUsage >= limit

      if (isRateLimited) {
        throw new Error(`Rate limit exceeded. Max ${limit} requests per ${options.interval ? options.interval / 1000 : 60} seconds`)
      }

      return {
        limit,
        current: currentUsage,
        remaining: Math.max(0, limit - currentUsage),
        reset: new Date(Date.now() + (options.interval || 60000))
      }
    },
  }
}

function getClientId(request: NextRequest): string {
  // Try to get user ID from session/token first
  const userId = request.headers.get('x-user-id')
  if (userId) return `user:${userId}`

  // Fallback to IP address
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : request.ip
  return `ip:${ip || 'unknown'}`
}