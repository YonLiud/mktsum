import { z } from 'zod'

export const createUserSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(32, 'Username must be at most 32 characters')
    .regex(/^[a-zA-Z0-9._@-]+$/, 'Username may only contain letters, numbers, and . _ @ -')
    .trim(),
  name: z.string().min(1, 'Name is required').trim(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  ntfy_topic: z.string().min(1).trim().optional(),
  terms_accepted: z.literal(true, { errorMap: () => ({ message: 'You must accept the terms to create an account' }) }),
  turnstile_token: z.string().min(1, 'Captcha token is required'),
})

export const updateUserSchema = z.object({
  name: z.string().min(1, 'Name cannot be empty').trim().optional(),
  ntfy_topic: z.string().min(1, 'ntfy_topic cannot be empty').trim().optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'No valid fields to update'
})

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>