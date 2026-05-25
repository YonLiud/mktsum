import { z } from 'zod'

const tickerString = z.string().min(1, 'Ticker is required').toUpperCase()

export const addTickerSchema = z.union([
  z.object({ ticker: tickerString }).transform(({ ticker }) => ({ tickers: [ticker] })),
  z.object({ tickers: z.array(tickerString).min(1, 'At least one ticker is required') }),
])

export const removeTickerSchema = z.object({
  ticker: tickerString,
})

export type AddTickerInput = z.infer<typeof addTickerSchema>
export type RemoveTickerInput = z.infer<typeof removeTickerSchema>