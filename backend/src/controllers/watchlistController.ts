import type { Request, Response, NextFunction } from 'express'
import { watchlistService } from '../services/watchlistService.ts'
import { AppError } from '../middleware/errorHandler.ts'

export const watchlistController = {
  getByUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user_id } = req.body as { user_id: string }

      if (!user_id || typeof user_id !== 'string' || user_id.trim().length === 0) {
        throw new AppError('Invalid user_id', 400)
      }

      const result = await watchlistService.getByUser(user_id)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  },

  getAllTickers: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await watchlistService.getAllUniqueTickers()
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  },

  getUsersByTickers: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { ticker } = req.body as { ticker: string }

      if (!ticker || typeof ticker !== 'string' || ticker.trim().length === 0) {
        throw new AppError('Invalid ticker', 400)
      }

      const result = await watchlistService.getUsersByTicker(ticker)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user_id, ticker } = req.body
      const validated = watchlistService.validateAddTicker(user_id, ticker)
      const result = await watchlistService.addTicker(validated.user_id, validated.ticker)

      if ('error' in result) {
        throw new AppError(result.error, 400)
      }

      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user_id, ticker } = req.body
      const validated = watchlistService.validateRemoveTicker(user_id, ticker)
      const result = await watchlistService.removeTicker(validated.user_id, validated.ticker)

      if ('error' in result) {
        throw new AppError(result.error, 400)
      }

      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  },

  hasTicker: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user_id, ticker } = req.body

      if (!user_id || typeof user_id !== 'string' || user_id.trim().length === 0) {
        throw new AppError('Invalid user_id', 400)
      }

      if (!ticker || typeof ticker !== 'string' || ticker.trim().length === 0) {
        throw new AppError('Invalid ticker', 400)
      }

      const result = await watchlistService.hasTicker(user_id, ticker)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  },
}
