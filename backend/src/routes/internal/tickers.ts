import { Hono } from 'hono'
import { tickersController } from '../../controllers/tickers'

const router = new Hono()

router.get('/', tickersController.getAll)

export default router
