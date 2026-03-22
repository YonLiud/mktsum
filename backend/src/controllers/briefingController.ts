import type { Request, Response, NextFunction } from 'express'
import { briefingService } from '../services/briefingService.ts'
import { AppError } from '../middleware/errorHandler.ts'

export const briefingController = {
  getAll: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await briefingService.getAll()
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  },

  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { briefingId } = req.params as { briefingId: string }

      if (!briefingId || typeof briefingId !== 'string' || briefingId.trim().length === 0) {
        throw new AppError('Invalid briefing_id', 400)
      }

      const result = await briefingService.getById(briefingId)

      if (!result) {
        throw new AppError('Briefing not found', 404)
      }

      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  },

  getByUser: async (req: Request, res: Response, next: NextFunction) => {
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

  getLatestByUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params as { userId: string }

      if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
        throw new AppError('Invalid user_id', 400)
      }

      const result = await briefingService.getLatestByUser(userId)

      if (!result) {
        throw new AppError('No briefings found for user', 404)
      }

      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = briefingService.validateCreate(req.body)
      const result = await briefingService.create(validated)
      res.status(201).json(result)
    } catch (error) {
      next(error)
    }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { briefingId } = req.params as { briefingId: string }

      if (!briefingId || typeof briefingId !== 'string' || briefingId.trim().length === 0) {
        throw new AppError('Invalid briefing_id', 400)
      }

      const validated = briefingService.validateUpdate(req.body)
      const result = await briefingService.update(briefingId, validated)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { briefingId } = req.params as { briefingId: string }

      if (!briefingId || typeof briefingId !== 'string' || briefingId.trim().length === 0) {
        throw new AppError('Invalid briefing_id', 400)
      }

      const result = await briefingService.delete(briefingId)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  },
}
