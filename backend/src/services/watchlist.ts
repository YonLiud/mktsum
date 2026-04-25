import { eq } from 'drizzle-orm'
import { db } from '../db'
import { watchlist, tickers } from '../db/schema'
import { generateId } from '../lib/nanoid'
import { tickersService } from './tickers'

export const watchlistService = {
  getByUserId: async (userId: string) => {
    return await db
      .select({
        watchlist_id: watchlist.watchlist_id,
        user_id: watchlist.user_id,
        ticker: watchlist.ticker,
        ticker_name: tickers.name,
        created_at: watchlist.created_at,
      })
      .from(watchlist)
      .leftJoin(tickers, eq(watchlist.ticker, tickers.symbol))
      .where(eq(watchlist.user_id, userId))
  },

  getAllUniqueTickers: async () => {
    const rows = await db.selectDistinct({ ticker: watchlist.ticker }).from(watchlist)
    return rows.map(r => r.ticker)
  },

  add: async (userId: string, ticker: string) => {
    const symbol = ticker.toUpperCase()
    const resolved = await tickersService.getOrCreate(symbol)
    if (!resolved) return null
    const watchlist_id = generateId()
    const [entry] = await db
      .insert(watchlist)
      .values({ watchlist_id, user_id: userId, ticker: symbol })
      .returning()
    return entry
  },

  addMany: async (userId: string, tickers: string[]) => {
    const entries = []
    for (const ticker of tickers) {
      entries.push(await watchlistService.add(userId, ticker))
    }
    return entries
  },

  remove: async (watchlistId: string) => {
    const [entry] = await db
      .delete(watchlist)
      .where(eq(watchlist.watchlist_id, watchlistId))
      .returning()
    return entry
  },

  removeByTicker: async (userId: string, ticker: string) => {
    const [entry] = await db
      .delete(watchlist)
      .where(eq(watchlist.user_id, userId) && eq(watchlist.ticker, ticker.toUpperCase()))
      .returning()
    return entry
  },
}