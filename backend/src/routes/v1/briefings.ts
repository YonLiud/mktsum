import { Hono } from 'hono'
import { briefingController } from '../../controllers/briefings'
import { requireAuth, requireSelf, optionalAuth } from '../../middleware/auth'

const router = new Hono()

router.get('/user/:userId/latest', requireAuth, requireSelf('userId'), briefingController.getLatest)
router.get('/user/:userId', requireAuth, requireSelf('userId'), briefingController.getByUserId)
router.get('/:id', optionalAuth, briefingController.getById)
router.post('/', requireAuth, briefingController.create)
router.delete('/:id', requireAuth, briefingController.delete)

export default router
