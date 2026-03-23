import { z } from 'zod'

export const addTickerSchema = z.object({
  ticker: z.string().min(1, 'Ticker is required').toUpperCase(),
})

export const removeTickerSchema = z.object({
  ticker: z.string().min(1, 'Ticker is required').toUpperCase(),
})

export type AddTickerInput = z.infer<typeof addTickerSchema>
export type RemoveTickerInput = z.infer<typeof removeTickerSchema>