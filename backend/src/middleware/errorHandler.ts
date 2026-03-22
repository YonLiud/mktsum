import type { Request, Response, NextFunction } from 'express'

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
  ) {
    super(message)
  }
}

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
    })
  }

  if ('statusCode' in err && typeof (err as any).statusCode === 'number') {
    return res.status((err as any).statusCode).json({
      error: err.message,
    })
  }

  // Prisma errors
  if (err.message.includes('Unique constraint failed')) {
    return res.status(409).json({
      error: 'Resource already exists',
    })
  }

  if (err.message.includes('Record to delete does not exist')) {
    return res.status(404).json({
      error: 'Resource not found',
    })
  }

  // Generic error
  res.status(500).json({
    error: 'Internal server error',
  })
}

export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
