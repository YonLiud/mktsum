import { Hono } from 'hono'
import { briefingController } from '../../controllers/briefings'

const router = new Hono()

router.get('/pending', briefingController.getPending)
router.post('/', briefingController.create)
router.post('/bulk', briefingController.bulkCreate)
router.patch('/:id/sent', briefingController.markSent)

export default router