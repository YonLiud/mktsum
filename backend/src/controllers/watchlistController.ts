import type { Request, Response } from 'express'
import { watchlistService } from "../services/watchlistService.ts";

export const watchlistController = {
  getByUser: async (req: Request, res: Response) => {
    const {user_id} = req.body
    const result = await watchlistService.getByUser(user_id)
    return res.json(result)

  },

  getAllTickers: async (_req: Request, res: Response) => {
    const result = await watchlistService.getAllUniqueTickers()
    return res.json(result)
  },

  getUsersByTickers: async (req: Request, res: Response) => {
    const { ticker } = req.body
    const result = await watchlistService.getUsersByTicker(ticker)
    return res.json(result)
  },

  create: async (req: Request, res: Response) => {
    const {user_id, ticker} = req.body
    const result = await watchlistService.addTicker(user_id, ticker)
    
    if ('error' in result) {
      return res.status(400).json(result)
    }
    
    return res.json(result)
  },

  delete: async (req: Request, res: Response) => {
    const {user_id, ticker} = req.body
    const result = await watchlistService.removeTicker(user_id, ticker)
    
    if ('error' in result) {
      return res.status(400).json(result)
    }
    
    return res.json(result)
  },

  hasTicker: async (req: Request, res: Response) => {
    const {user_id, ticker} = req.body
    const result = await watchlistService.hasTicker(user_id, ticker)
    return res.json(result)
  }
}
