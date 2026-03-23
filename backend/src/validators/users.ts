import { z } from 'zod'

export const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  ntfy_topic: z.string().min(1, 'ntfy_topic is required').trim(),
})

export const updateUserSchema = z.object({
  name: z.string().min(1, 'Name cannot be empty').trim().optional(),
  ntfy_topic: z.string().min(1, 'ntfy_topic cannot be empty').trim().optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'No valid fields to update'
})

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>