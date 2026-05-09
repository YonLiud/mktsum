import { Hono } from 'hono'
import { userService } from '../../services/users'

const router = new Hono()

router.get('/', async (c) => {
  const users = await userService.getAllWithTickers()
  return c.json(users)
})

export default router