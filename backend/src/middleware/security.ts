import type { Request, Response, NextFunction } from 'express'

export const securityHeaders = (_req: Request, res: Response, next: NextFunction) => {
  // Prevent clickjacking attacks
  res.header('X-Frame-Options', 'DENY')

  // Prevent MIME type sniffing
  res.header('X-Content-Type-Options', 'nosniff')

  // Enable XSS protection in older browsers
  res.header('X-XSS-Protection', '1; mode=block')

  // Prevent browsers from caching sensitive data
  res.header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  res.header('Pragma', 'no-cache')
  res.header('Expires', '0')

  // Prevent referrer leaking
  res.header('Referrer-Policy', 'strict-origin-when-cross-origin')

  // TODO: Enable HSTS in production when HTTPS is set up
  // if (process.env.NODE_ENV === 'production') {
  //   res.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  // }

  next()
}
