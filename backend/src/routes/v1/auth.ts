import { Hono } from 'hono'
import { authController } from '../../controllers/auth'
import { requireAuth } from '../../middleware/auth'

export const authRoutes = new Hono()

authRoutes.post('/login', authController.login)
authRoutes.post('/logout', requireAuth, authController.logout)
