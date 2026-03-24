import { z } from 'zod'

export const symbolSchema = z.object({
  symbol: z.string().min(1, 'Symbol is required').toUpperCase(),
})

export type SymbolInput = z.infer<typeof symbolSchema>
