import { Hono } from 'hono'
import { tickersController } from '../../controllers/tickers'

const router = new Hono()

router.get('/:symbol', tickersController.getBySymbol)

export default router
