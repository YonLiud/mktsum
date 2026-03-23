import { eq } from 'drizzle-orm'
import { db } from '../db'
import { watchlist } from '../db/schema'
import { generateId } from '../lib/nanoid'

export const watchlistService = {
  getByUserId: async (userId: string) => {
    return await db.select().from(watchlist).where(eq(watchlist.user_id, userId))
  },

  getAllUniqueTickers: async () => {
    const rows = await db.selectDistinct({ ticker: watchlist.ticker }).from(watchlist)
    return rows.map(r => r.ticker)
  },

  add: async (userId: string, ticker: string) => {
    const watchlist_id = generateId()
    const [entry] = await db
      .insert(watchlist)
      .values({ watchlist_id, user_id: userId, ticker: ticker.toUpperCase() })
      .returning()
    return entry
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