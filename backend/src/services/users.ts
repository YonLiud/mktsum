import { eq } from 'drizzle-orm'
import { db } from '../db'
import { users } from '../db/schema'
import { generateId } from '../lib/nanoid'

export const userService = {
  getById: async (userId: string) => {
    return await db.query.users.findFirst({
      where: eq(users.user_id, userId),
      with: {
        briefings: true,
        watchlist: true,
      },
    })
  },

  getAll: async () => {
    return await db.select().from(users)
  },

  getAllWithTickers: async () => {
    return await db.query.users.findMany({
      with: {
        watchlist: {
          columns: { ticker: true },
        },
      },
    })
  },

  create: async (data: { name: string; ntfy_topic: string }) => {
    const user_id = generateId()
    const [user] = await db.insert(users).values({ user_id, ...data }).returning()
    return user
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