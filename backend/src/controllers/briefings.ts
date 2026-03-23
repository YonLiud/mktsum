import type { Context } from 'hono'
import { briefingService } from '../services/briefings'
import { createBriefingSchema, bulkCreateBriefingSchema } from '../validators/briefings'

export const briefingController = {
  getByUserId: async (c: Context) => {
    const userId = c.req.param('userId')!
    const briefings = await briefingService.getByUserId(userId)
    return c.json(briefings)
  },

  getLatest: async (c: Context) => {
    const userId = c.req.param('userId')!
    const briefing = await briefingService.getLatest(userId)
    if (!briefing) return c.json({ error: 'No briefings found' }, 404)
    return c.json(briefing)
  },

  getPending: async (c: Context) => {
    const briefings = await briefingService.getPending()
    return c.json(briefings)
  },

  create: async (c: Context) => {
    const body = await c.req.json()
    const result = createBriefingSchema.safeParse(body)
    if (!result.success) return c.json({ error: result.error.flatten() }, 400)
    const briefing = await briefingService.create(result.data)
    return c.json(briefing, 201)
  },

  bulkCreate: async (c: Context) => {
    const body = await c.req.json()
    const result = bulkCreateBriefingSchema.safeParse(body)
    if (!result.success) return c.json({ error: result.error.flatten() }, 400)
    const briefings = await briefingService.bulkCreate(result.data)
    return c.json(briefings, 201)
  },

  markSent: async (c: Context) => {
    const id = c.req.param('id')!
    const briefing = await briefingService.markSent(id)
    if (!briefing) return c.json({ error: 'Briefing not found' }, 404)
    return c.json(briefing)
  },

  delete: async (c: Context) => {
    const id = c.req.param('id')!
    const briefing = await briefingService.delete(id)
    if (!briefing) return c.json({ error: 'Briefing not found' }, 404)
    return c.json({ success: true })
  },
}