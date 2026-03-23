import { Hono } from 'hono'
import { internalRoutes } from './internal'
import { v1Routes } from './v1'

const router = new Hono()

router.route('/internal', internalRoutes)
router.route('/v1', v1Routes)

export default router