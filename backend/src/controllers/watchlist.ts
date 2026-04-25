import type { Context } from 'hono'
import { watchlistService } from '../services/watchlist'
import { addTickerSchema, removeTickerSchema } from '../validators/watchlist'

export const watchlistController = {
  getByUserId: async (c: Context) => {
    const userId = c.req.param('userId')!
    const tickers = await watchlistService.getByUserId(userId)
    return c.json(tickers)
  },

  getAllUniqueTickers: async (c: Context) => {
    const tickers = await watchlistService.getAllUniqueTickers()
    return c.json(tickers)
  },

  add: async (c: Context) => {
    const userId = c.req.param('userId')!
    const body = await c.req.json()
    const result = addTickerSchema.safeParse(body)
    if (!result.success) return c.json({ error: result.error.flatten() }, 400)
    const entries = await watchlistService.addMany(userId, result.data.tickers)
    const failed = result.data.tickers.filter((_, i) => entries[i] === null)
    if (failed.length > 0) return c.json({ error: `Ticker(s) not found: ${failed.join(', ')}` }, 404)
    return c.json(entries.length === 1 ? entries[0] : entries, 201)
  },

  remove: async (c: Context) => {
    const id = c.req.param('id')!
    const entry = await watchlistService.remove(id)
    if (!entry) return c.json({ error: 'Entry not found' }, 404)
    return c.json({ success: true })
  },

  removeByTicker: async (c: Context) => {
    const userId = c.req.param('userId')!
    const body = await c.req.json()
    const result = removeTickerSchema.safeParse(body)
    if (!result.success) return c.json({ error: result.error.flatten() }, 400)
    const entry = await watchlistService.removeByTicker(userId, result.data.ticker)
    if (!entry) return c.json({ error: 'Entry not found' }, 404)
    return c.json({ success: true })
  },
}