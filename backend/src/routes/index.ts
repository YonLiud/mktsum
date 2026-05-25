import { Hono } from 'hono'
import { internalRoutes } from './internal'
import { v1Routes } from './v1'
import { shareRoutes } from './share'

const router = new Hono()

router.route('/internal', internalRoutes)
router.route('/v1', v1Routes)
router.route('/share', shareRoutes)

export default router