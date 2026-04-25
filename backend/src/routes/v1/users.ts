import { Hono } from 'hono'
import { userController } from '../../controllers/users'
import { requireAuth, requireAdmin, requireSelf } from '../../middleware/auth'

const router = new Hono()

router.get('/', requireAdmin, userController.getAll)
router.get('/:id', requireAuth, requireSelf('id'), userController.getById)
router.post('/', userController.create)
router.patch('/:id', requireAuth, requireSelf('id'), userController.update)
router.delete('/:id', requireAdmin, userController.delete)

export default router
