import type { Request, Response, NextFunction } from 'express'
import { userService } from '../services/userService.ts'
import { briefingService } from '../services/briefingService.ts'
import { AppError } from '../middleware/errorHandler.ts'

export const userController = {
  getAll: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await userService.getAll()
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  },

  getAllWithTickers: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await userService.getAllWithTickers()
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  },

  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params as { userId: string }

      if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
        throw new AppError('Invalid user_id', 400)
      }

      const result = await userService.getById(userId)

      if (!result) {
        throw new AppError('User not found', 404)
      }

      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  },

  getTickers: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params as { userId: string }

      if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
        throw new AppError('Invalid user_id', 400)
      }

      const result = await userService.getTickers(userId)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  },

  getBriefings: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params as { userId: string }

      if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
        throw new AppError('Invalid user_id', 400)
      }

      const result = await briefingService.getByUser(userId)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = userService.validateCreate(req.body)
      const result = await userService.create(validated)
      res.status(201).json(result)
    } catch (error) {
      next(error)
    }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params as { userId: string }

      if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
        throw new AppError('Invalid user_id', 400)
      }

      const validated = userService.validateUpdate(req.body)
      const result = await userService.update(userId, validated)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params as { userId: string }

      if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
        throw new AppError('Invalid user_id', 400)
      }

      const result = await userService.delete(userId)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  },
}
