// lib/validations/settings.ts
import { z } from 'zod'

export const updateSettingsSchema = z.object({
  displayName: z
    .string()
    .min(2, 'Display name must be at least 2 characters')
    .max(50, 'Display name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Display name can only contain letters and spaces')
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
  
  gender: z
    .enum(['male', 'female', 'other', 'prefer-not-to-say'], {
      errorMap: () => ({ message: 'Please select a valid gender option' })
    })
    .optional(),
  
  region: z
    .string()
    .min(2, 'Region must be at least 2 characters')
    .max(100, 'Region must be less than 100 characters')
    .optional(),
  
  avatarUrl: z
    .string()
    .url('Invalid avatar URL')
    .optional()
    .nullable(),
})

export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Current password is required'),
  
  newPassword: z
    .string()
    .min(6, 'New password must be at least 6 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  
  confirmPassword: z
    .string()
    .min(1, 'Password confirmation is required')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>