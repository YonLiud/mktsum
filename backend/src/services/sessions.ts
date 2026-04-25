import { eq, gt } from 'drizzle-orm'
import { db } from '../db'
import { sessions, users } from '../db/schema'
import { generateId } from '../lib/nanoid'

const SESSION_TTL_DAYS = 30

export const sessionService = {
  create: async (userId: string) => {
    const session_id = generateId()
    const expires_at = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000)
    const [session] = await db.insert(sessions).values({ session_id, user_id: userId, expires_at }).returning()
    return session
  },

  validate: async (token: string) => {
    const row = await db.query.sessions.findFirst({
      where: (s) => eq(s.session_id, token),
      with: { user: true },
    })
    if (!row) return null
    if (row.expires_at < new Date()) {
      await db.delete(sessions).where(eq(sessions.session_id, token))
      return null
    }
    return row.user
  },

  delete: async (token: string) => {
    await db.delete(sessions).where(eq(sessions.session_id, token))
  },

  deleteAllForUser: async (userId: string) => {
    await db.delete(sessions).where(eq(sessions.user_id, userId))
  },
}
