import { Hono } from 'hono'
import { tickersController } from '../../controllers/tickers'

const router = new Hono()

router.get('/', tickersController.getAll)
router.post('/:symbol/refresh', tickersController.refresh)
router.post('/refresh-all', tickersController.refreshAll)

export default router
