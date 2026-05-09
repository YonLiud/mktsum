import { Hono } from 'hono'
import { userService } from '../../services/users'

const router = new Hono()

router.get('/', async (c) => {
  const users = await userService.getAllWithTickers()
  return c.json(users)
})

router.get('/:id', async (c) => {
  const user = await userService.getById(c.req.param('id'))
  if (!user) return c.json({ error: 'User not found' }, 404)
  return c.json(user)
})

export default router