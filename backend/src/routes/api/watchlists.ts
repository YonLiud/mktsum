import { Router } from 'express'
import { watchlistController } from '../../controllers/watchlistController.ts'

const router = Router()

// Public read-only access
router.get('/tickers', watchlistController.getAllTickers)

export default router
