// lib/validations/profile.ts
import { z } from 'zod'

export const updateProfileSchema = z.object({
  displayName: z
    .string()
    .min(2, 'Display name must be at least 2 characters')
    .max(50, 'Display name must be less than 50 characters')
    .optional(),
  
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .optional(),
  
  email: z
    .string()
    .email('Invalid email format')
    .optional(),
  
  bio: z
    .string()
    .max(500, 'Bio must be less than 500 characters')
    .optional(),
  
  region: z
    .string()
    .max(100, 'Region must be less than 100 characters')
    .optional(),
  
  gender: z
    .enum(['male', 'female', 'other', 'prefer-not-to-say'], {
      errorMap: () => ({ message: 'Please select a valid gender option' })
    })
    .optional(),
  
  coverImageUrl: z
    .string()
    .url('Invalid cover image URL')
    .optional()
    .nullable()
})

export const profileQuerySchema = z.object({
  userId: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(12),
  status: z.enum(['published', 'verification', 'rejected']).optional(),
  sortBy: z.enum(['recent', 'popular', 'downloads', 'alphabetical']).default('recent')
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type ProfileQueryInput = z.infer<typeof profileQuerySchema>