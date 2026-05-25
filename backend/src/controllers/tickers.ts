import type { Context } from 'hono'
import { tickersService } from '../services/tickers'
import { symbolSchema } from '../validators/tickers'

export const tickersController = {
  getAll: async (c: Context) => {
    const tickers = await tickersService.getAll()
    return c.json(tickers)
  },

  getBySymbol: async (c: Context) => {
    const symbol = c.req.param('symbol')!.toUpperCase()
    const ticker = await tickersService.getBySymbol(symbol)
    if (!ticker) return c.json({ error: 'Ticker not found' }, 404)
    return c.json(ticker)
  },

  refresh: async (c: Context) => {
    const result = symbolSchema.safeParse({ symbol: c.req.param('symbol') })
    if (!result.success) return c.json({ error: result.error.flatten() }, 400)
    const ticker = await tickersService.refresh(result.data.symbol)
    if (!ticker) return c.json({ error: 'Ticker not found' }, 404)
    return c.json(ticker)
  },

  refreshAll: async (c: Context) => {
    const tickers = await tickersService.refreshAll()
    return c.json(tickers)
  },
}
