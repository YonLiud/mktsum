import { z } from 'zod'

export const createUserSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').trim(),
  name: z.string().min(1, 'Name is required').trim(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  ntfy_topic: z.string().min(1).trim().optional(),
})

export const updateUserSchema = z.object({
  name: z.string().min(1, 'Name cannot be empty').trim().optional(),
  ntfy_topic: z.string().min(1, 'ntfy_topic cannot be empty').trim().optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'No valid fields to update'
})

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>