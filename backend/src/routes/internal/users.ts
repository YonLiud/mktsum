import { Router } from 'express'
import { userController } from '../../controllers/userController.ts'

const router = Router()

router.get('/', userController.getAll)
router.get('/:userId', userController.getById)
router.post('/', userController.create)
router.patch('/:userId', userController.update)
router.delete('/:userId', userController.delete)

export default router
