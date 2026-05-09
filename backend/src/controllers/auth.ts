import type { Context } from 'hono'
import { setCookie, deleteCookie } from 'hono/cookie'
import { eq } from 'drizzle-orm'
import { db } from '../db'
import { users } from '../db/schema'
import { sessionService } from '../services/sessions'
import { loginSchema } from '../validators/auth'

const COOKIE_NAME = 'session'
const COOKIE_TTL = 30 * 24 * 60 * 60

export const authController = {
  login: async (c: Context) => {
    const body = await c.req.json()
    const parsed = loginSchema.safeParse(body)
    if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)

    const { username, password } = parsed.data

    const user = await db.query.users.findFirst({ where: eq(users.username, username) })
    if (!user) return c.json({ error: 'Invalid credentials' }, 401)

    const valid = await Bun.password.verify(password, user.password_hash)
    if (!valid) return c.json({ error: 'Invalid credentials' }, 401)

    const session = await sessionService.create(user.user_id)

    const isProduction = Bun.env.NODE_ENV === 'production'
    setCookie(c, COOKIE_NAME, session.session_id, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'Strict' : 'Lax',
      path: '/',
      maxAge: COOKIE_TTL,
    })

    return c.json({
      user_id: user.user_id,
      username: user.username,
      name: user.name,
      role: user.role,
    })
  },

  logout: async (c: Context) => {
    const token = c.get('token') as string
    await sessionService.delete(token)
    deleteCookie(c, COOKIE_NAME, { path: '/' })
    return c.json({ success: true })
  },

  logoutAll: async (c: Context) => {
    const user = c.get('user') as { user_id: string }
    await sessionService.deleteAllForUser(user.user_id)
    return c.json({ success: true })
  },
}
