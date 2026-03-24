import YahooFinance from 'yahoo-finance2'
const yf = new YahooFinance({ suppressNotices: ['yahooSurvey'] })
import { eq } from 'drizzle-orm'
import { db } from '../db'
import { tickers } from '../db/schema'

export const tickersService = {
  getAll: async () => {
    return await db.select().from(tickers)
  },

  getBySymbol: async (symbol: string) => {
    const [ticker] = await db.select().from(tickers).where(eq(tickers.symbol, symbol)).limit(1)
    return ticker ?? null
  },

  getOrCreate: async (symbol: string) => {
    const existing = await db.select().from(tickers).where(eq(tickers.symbol, symbol)).limit(1)
    if (existing.length > 0) return existing[0]

    const quote = await yf.quoteSummary(symbol, { modules: ['price'] })
    const name = quote.price?.shortName ?? quote.price?.longName

    if (!name) throw new Error(`Invalid ticker: ${symbol}`)

    const [ticker] = await db
      .insert(tickers)
      .values({ symbol, name, description: null })
      .returning()

    return ticker
  },

  refresh: async (symbol: string) => {
    let quote
    try {
      quote = await yf.quoteSummary(symbol, { modules: ['price'] })
    } catch {
      return null
    }
    const name = quote.price?.shortName ?? quote.price?.longName
    if (!name) return null

    const [ticker] = await db
      .update(tickers)
      .set({ name })
      .where(eq(tickers.symbol, symbol))
      .returning()

    return ticker ?? null
  },

  refreshAll: async () => {
    const all = await db.select().from(tickers)
    return await Promise.all(all.map(t => tickersService.refresh(t.symbol)))
  },
}
