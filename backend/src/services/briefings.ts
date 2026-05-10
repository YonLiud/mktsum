import { eq, isNull, or } from 'drizzle-orm'
import { db } from '../db'
import { briefings } from '../db/schema'
import { generateId } from '../lib/nanoid'

export const briefingService = {
  getById: async (briefingId: string) => {
    const briefing = await db.query.briefings.findFirst({
      where: eq(briefings.briefing_id, briefingId),
      with: { user: { columns: { name: true } } },
    })
    if (!briefing) return undefined
    const { user, ...rest } = briefing
    return { ...rest, user_name: user.name }
  },

  getByUserId: async (userId: string) => {
    return await db.query.briefings.findMany({
      where: eq(briefings.user_id, userId),
    })
  },

  getLatest: async (userId: string) => {
    return await db.query.briefings.findFirst({
      where: eq(briefings.user_id, userId),
      orderBy: (briefings, { desc }) => [desc(briefings.created_at)],
    })
  },

  getPending: async () => {
    return await db.select().from(briefings).where(eq(briefings.notif_sent, false))
  },

  create: async (data: {
    user_id: string
    subject?: string
    full_summary: string
    short_summary: string
    sources?: { ticker: string; title: string; url: string }[]
  }) => {
    const briefing_id = generateId()
    const [briefing] = await db.insert(briefings).values({ briefing_id, ...data }).returning()
    return briefing
  },

  bulkCreate: async (data: {
    user_id: string
    subject?: string
    full_summary: string
    short_summary: string
    sources?: { ticker: string; title: string; url: string }[]
  }[]) => {
    const values = data.map(d => ({ briefing_id: generateId(), ...d }))
    return await db.insert(briefings).values(values).returning()
  },

  markSent: async (briefingId: string) => {
    const [briefing] = await db
      .update(briefings)
      .set({ notif_sent: true })
      .where(eq(briefings.briefing_id, briefingId))
      .returning()
    return briefing
  },

  setPublic: async (briefingId: string, isPublic: boolean) => {
    const [briefing] = await db
      .update(briefings)
      .set({ is_public: isPublic })
      .where(eq(briefings.briefing_id, briefingId))
      .returning()
    return briefing
  },

  delete: async (briefingId: string) => {
    const [briefing] = await db.delete(briefings).where(eq(briefings.briefing_id, briefingId)).returning()
    return briefing
  },
}