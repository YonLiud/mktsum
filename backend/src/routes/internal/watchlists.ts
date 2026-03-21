import { Router } from 'express'
import { watchlistController } from '../../controllers/watchlistController.ts'

const router = Router()

router.get('/tickers', watchlistController.getAllTickers)
router.post('/users', watchlistController.getUsersByTickers)
router.post('/check', watchlistController.hasTicker)
router.post('/', watchlistController.create)
router.post('/list', watchlistController.getByUser)
router.delete('/', watchlistController.delete)

export default router
