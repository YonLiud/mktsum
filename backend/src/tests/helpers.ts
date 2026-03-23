import { db } from '../db'
import { users, briefings, watchlist } from '../db/schema'
import { generateId } from '../lib/nanoid'

/** Delete all rows in FK-safe order (children before parents). */
export async function cleanDb() {
  await db.delete(watchlist)
  await db.delete(briefings)
  await db.delete(users)
}

export async function insertUser(data?: { name?: string; ntfy_topic?: string }) {
  const [user] = await db
    .insert(users)
    .values({
      user_id: generateId(),
      name: data?.name ?? 'Test User',
      ntfy_topic: data?.ntfy_topic ?? 'test-topic',
    })
    .returning()
  return user
}

export async function insertBriefing(
  userId: string,
  data?: {
    full_summary?: string
    short_summary?: string
    sources?: string[]
    notif_sent?: boolean
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
    })
    .returning()
  return briefing
}

export async function insertWatchlistEntry(userId: string, ticker: string) {
  const [entry] = await db
    .insert(watchlist)
    .values({
      watchlist_id: generateId(),
      user_id: userId,
      ticker: ticker.toUpperCase(),
    })
    .returning()
  return entry
}
