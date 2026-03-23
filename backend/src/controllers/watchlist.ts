import type { Context } from 'hono'
import { watchlistService } from '../services/watchlist'

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
    const { ticker } = await c.req.json()
    const entry = await watchlistService.add(userId, ticker)
    return c.json(entry, 201)
  },

  remove: async (c: Context) => {
    const id = c.req.param('id')!
    const entry = await watchlistService.remove(id)
    if (!entry) return c.json({ error: 'Entry not found' }, 404)
    return c.json({ success: true })
  },

  removeByTicker: async (c: Context) => {
    const userId = c.req.param('userId')!
    const { ticker } = await c.req.json()
    const entry = await watchlistService.removeByTicker(userId, ticker)
    if (!entry) return c.json({ error: 'Entry not found' }, 404)
    return c.json({ success: true })
  },
}