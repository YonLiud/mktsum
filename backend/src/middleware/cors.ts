import type { Request, Response, NextFunction } from 'express'

export const corsMiddleware = (_req: Request, res: Response, next: NextFunction) => {
  // Allow all origins during development
  // TODO: Restrict to specific frontend URL in production
  res.header('Access-Control-Allow-Origin', '*')

  // Allow methods used in this API
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS')

  // Allow common headers
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  // Handle preflight requests
  if (_req.method === 'OPTIONS') {
    return res.sendStatus(200)
  }

  next()
}
