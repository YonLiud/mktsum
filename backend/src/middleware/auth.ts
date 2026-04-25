import type { Context, Next } from 'hono'
import { sessionService } from '../services/sessions'

function extractToken(c: Context): string | null {
  const header = c.req.header('Authorization')
  if (!header?.startsWith('Bearer ')) return null
  return header.slice(7)
}

export async function requireAuth(c: Context, next: Next) {
  const token = extractToken(c)
  if (!token) return c.json({ error: 'Unauthorized' }, 401)

  const user = await sessionService.validate(token)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)

  c.set('user', user)
  c.set('token', token)
  await next()
}

export async function requireAdmin(c: Context, next: Next) {
  const token = extractToken(c)
  if (!token) return c.json({ error: 'Unauthorized' }, 401)

  const user = await sessionService.validate(token)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)
  if (user.role !== 'admin') return c.json({ error: 'Forbidden' }, 403)

  c.set('user', user)
  c.set('token', token)
  await next()
}

export async function optionalAuth(c: Context, next: Next) {
  const token = extractToken(c)
  if (token) {
    const user = await sessionService.validate(token)
    if (user) {
      c.set('user', user)
      c.set('token', token)
    }
  }
  await next()
}

export function requireSelf(paramName: string) {
  return async (c: Context, next: Next) => {
    const caller = c.get('user') as { user_id: string; role: string }
    const id = c.req.param(paramName)
    if (caller.user_id !== id && caller.role !== 'admin') {
      return c.json({ error: 'Forbidden' }, 403)
    }
    await next()
  }
}
