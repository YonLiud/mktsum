import { z } from 'zod'

export const createBriefingSchema = z.object({
  user_id: z.string().min(1, 'user_id is required'),
  full_summary: z.string().min(1, 'full_summary is required'),
  short_summary: z.string().min(1, 'short_summary is required'),
  sources: z.array(z.object({ ticker: z.string(), title: z.string(), url: z.string() }))
})

export const bulkCreateBriefingSchema = z.array(createBriefingSchema).min(1, 'At least one briefing is required')

export type CreateBriefingInput = z.infer<typeof createBriefingSchema>
export type BulkCreateBriefingInput = z.infer<typeof bulkCreateBriefingSchema>