import type { Request, Response } from 'express'
import { userService } from '../services/userService.ts'

export const userController = {
  getAll: async (_req: Request, res: Response) => {
    const result = await userService.getAll()
    res.json(result)
  },

  getById: async (req: Request, res: Response) => {
    const { userId } = req.params as { userId: string }
    const result = await userService.getById(userId)
    res.json(result)
  },

  create: async (req: Request, res: Response) => {
    const { name, ntfy_topic } = req.body
    const result = await userService.create({ name, ntfy_topic })
    res.status(201).json(result)
  },

  update: async (req: Request, res: Response) => {
    const { userId } = req.params as { userId: string }
    const data = req.body
    const result = await userService.update(userId, data)
    res.json(result)
  },

  delete: async (req: Request, res: Response) => {
    const { userId } = req.params as { userId: string }
    const result = await userService.delete(userId)
    res.json(result)
  },
}
