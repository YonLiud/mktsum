import { Hono } from 'hono'
import { briefingController } from '../../controllers/briefings'

const router = new Hono()

router.get('/user/:userId/latest', briefingController.getLatest)
router.get('/user/:userId', briefingController.getByUserId)
router.get('/:id', briefingController.getById)
router.post('/', briefingController.create)
router.delete('/:id', briefingController.delete)

export default router