import type { Context } from 'hono'
import { userService } from '../services/users'
import { createUserSchema, updateUserSchema } from '../validators/users'

export const userController = {
  getAll: async (c: Context) => {
    const users = await userService.getAll()
    return c.json(users)
  },

  getById: async (c: Context) => {
    const id = c.req.param('id')!
    const user = await userService.getById(id)
    if (!user) return c.json({ error: 'User not found' }, 404)
    return c.json(user)
  },

  create: async (c: Context) => {
    const body = await c.req.json()
    const result = createUserSchema.safeParse(body)
    if (!result.success) return c.json({ error: result.error.flatten() }, 400)
    const user = await userService.create(result.data)
    return c.json(user, 201)
  },

  update: async (c: Context) => {
    const id = c.req.param('id')!
    const body = await c.req.json()
    const result = updateUserSchema.safeParse(body)
    if (!result.success) return c.json({ error: result.error.flatten() }, 400)
    const user = await userService.update(id, result.data)
    if (!user) return c.json({ error: 'User not found' }, 404)
    return c.json(user)
  },

  delete: async (c: Context) => {
    const id = c.req.param('id')!
    const user = await userService.delete(id)
    if (!user) return c.json({ error: 'User not found' }, 404)
    return c.json({ success: true })
  },
}
