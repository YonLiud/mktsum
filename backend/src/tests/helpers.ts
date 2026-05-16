import { db } from '../db'
import { users, briefings, watchlist, tickers, sessions } from '../db/schema'
import { generateId } from '../lib/nanoid'

export async function cleanDb() {
  await db.delete(watchlist)
  await db.delete(briefings)
  await db.delete(sessions)
  await db.delete(users)
  await db.delete(tickers)
}

export async function insertUser(data?: {
  name?: string
  ntfy_topic?: string
  username?: string
  role?: 'user' | 'admin'
}) {
  const [user] = await db
    .insert(users)
    .values({
      user_id: generateId(),
      username: data?.username ?? `u_${generateId()}`,
      name: data?.name ?? 'Test User',
      password_hash: await Bun.password.hash('password123'),
      role: data?.role ?? 'user',
      ntfy_topic: data?.ntfy_topic ?? 'test-topic',
    })
    .returning()
  return user!
}

export async function createSession(userId: string) {
  const session_id = generateId()
  const expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  await db.insert(sessions).values({ session_id, user_id: userId, expires_at })
  return session_id
}

export function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` }
}

export async function insertBriefing(
  userId: string,
  data?: {
    full_summary?: string
    short_summary?: string
    sources?: string[]
    notif_sent?: boolean
    is_public?: boolean
  }
) {
  const [briefing] = await db
    .insert(briefings)
    .values({
      briefing_id: generateId(),
      user_id: userId,
      full_summary: data?.full_summary ?? 'Full market summary text',
      short_summary: data?.short_summary ?? 'Short summary',
      sources: data?.sources,
      notif_sent: data?.notif_sent ?? false,
      is_public: data?.is_public ?? false,
    })
    .returning()
  return briefing
}

export async function insertTicker(symbol: string, name?: string) {
  const [ticker] = await db
    .insert(tickers)
    .values({ symbol: symbol.toUpperCase(), name: name ?? symbol.toUpperCase() })
    .onConflictDoNothing()
    .returning()
  return ticker
}

export async function insertWatchlistEntry(userId: string, ticker: string) {
  await insertTicker(ticker)
  const [entry] = await db
    .insert(watchlist)
    .values({
      watchlist_id: generateId(),
      user_id: userId,
      ticker: ticker.toUpperCase(),
    })
    .returning()
  return entry!
}
