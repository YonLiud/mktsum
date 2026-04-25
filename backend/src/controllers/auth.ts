import type { Context } from 'hono'
import { eq } from 'drizzle-orm'
import { db } from '../db'
import { users } from '../db/schema'
import { sessionService } from '../services/sessions'
import { loginSchema } from '../validators/auth'

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

    return c.json({
      token: session.session_id,
      user_id: user.user_id,
      username: user.username,
      name: user.name,
      role: user.role,
    })
  },

  logout: async (c: Context) => {
    const token = c.get('token') as string
    await sessionService.delete(token)
    return c.json({ success: true })
  },
}
