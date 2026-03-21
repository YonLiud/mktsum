import type { Request, Response } from 'express'
import { briefingService } from '../services/briefingService.ts'

export const briefingController = {
  getAll: async (_req: Request, res: Response) => {
    const result = await briefingService.getAll()
    res.json(result)
  },

  getById: async (req: Request, res: Response) => {
    const { briefingId } = req.params as { briefingId: string }
    const result = await briefingService.getById(briefingId)
    res.json(result)
  },

  getByUser: async (req: Request, res: Response) => {
    const { userId } = req.params as { userId: string }
    const result = await briefingService.getByUser(userId)
    res.json(result)
  },

  getLatestByUser: async (req: Request, res: Response) => {
    const { userId } = req.params as { userId: string }
    const result = await briefingService.getLatestByUser(userId)
    res.json(result)
  },

  create: async (req: Request, res: Response) => {
    const { user_id, full_summary, short_summary, sources, notif_sent } = req.body
    const sourcesString = Array.isArray(sources) ? JSON.stringify(sources) : sources
    const notif_sentBool = typeof notif_sent === 'string' ? notif_sent === 'true' : notif_sent
    const result = await briefingService.create({ user_id, full_summary, short_summary, sources: sourcesString, notif_sent: notif_sentBool })
    res.status(201).json(result)
  },

  update: async (req: Request, res: Response) => {
    const { briefingId } = req.params as { briefingId: string }
    const data = { ...req.body }
    if (data.sources && Array.isArray(data.sources)) {
      data.sources = JSON.stringify(data.sources)
    }
    if (data.notif_sent !== undefined) {
      data.notif_sent = typeof data.notif_sent === 'string' ? data.notif_sent === 'true' : data.notif_sent
    }
    const result = await briefingService.update(briefingId, data)
    res.json(result)
  },

  delete: async (req: Request, res: Response) => {
    const { briefingId } = req.params as { briefingId: string }
    const result = await briefingService.delete(briefingId)
    res.json(result)
  },
}
