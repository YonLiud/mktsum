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

  create: async (req: Request, res: Response) => {
    const { user_id, full_summary, short_summary } = req.body
    const result = await briefingService.create({ user_id, full_summary, short_summary })
    res.status(201).json(result)
  },

  update: async (req: Request, res: Response) => {
    const { briefingId } = req.params as { briefingId: string }
    const data = req.body
    const result = await briefingService.update(briefingId, data)
    res.json(result)
  },

  delete: async (req: Request, res: Response) => {
    const { briefingId } = req.params as { briefingId: string }
    const result = await briefingService.delete(briefingId)
    res.json(result)
  },
}
