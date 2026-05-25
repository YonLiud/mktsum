import { eq } from 'drizzle-orm'
import { HTTPException } from 'hono/http-exception'
import { db } from '../db'
import { users } from '../db/schema'
import { generateId } from '../lib/nanoid'

export const userService = {
  getById: async (userId: string) => {
    return await db.query.users.findFirst({
      where: eq(users.user_id, userId),
      columns: { password_hash: false },
      with: {
        briefings: {
          columns: {
            briefing_id: true,
            created_at: true,
            short_summary: true,
          },
        },
        watchlist: true,
      },
    })
  },

  getAll: async () => {
    return await db.query.users.findMany({
      columns: { password_hash: false },
      with: {
        watchlist: true,
      },
    })
  },

  getAllWithTickers: async () => {
    return await db.query.users.findMany({
      columns: { password_hash: false },
      with: {
        watchlist: {
          columns: { ticker: true },
        },
      },
    })
  },

  create: async (data: { username: string; name: string; password: string; ntfy_topic?: string; terms_accepted: true }) => {
    const user_id = generateId()
    const password_hash = await Bun.password.hash(data.password)
    const { password, terms_accepted, ...rest } = data
    try {
      const [user] = await db.insert(users).values({ user_id, ...rest, password_hash, terms_accepted_at: new Date() }).returning()
      const { password_hash: _, ...safeUser } = user!
      return safeUser
    } catch (err: any) {
      if (err?.cause?.constraint === 'users_username_unique') throw new HTTPException(409, { message: 'Username already taken' })
      throw err
    }
  },

  update: async (userId: string, data: Partial<{ name: string; ntfy_topic: string }>) => {
    const [user] = await db.update(users).set(data).where(eq(users.user_id, userId)).returning()
    return user
  },

  delete: async (userId: string) => {
    const [user] = await db.delete(users).where(eq(users.user_id, userId)).returning()
    return user
  },
}