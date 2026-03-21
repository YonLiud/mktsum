import { Router } from 'express'
import { briefingController } from '../../controllers/briefingController.ts'

const router = Router()

router.get('/', briefingController.getAll)
router.get('/:briefingId', briefingController.getById)
router.get('/user/:userId', briefingController.getByUser)
router.post('/', briefingController.create)
router.patch('/:briefingId', briefingController.update)
router.delete('/:briefingId', briefingController.delete)

export default router
