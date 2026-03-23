import { Hono } from 'hono'
import { watchlistController } from '../../controllers/watchlist'

const router = new Hono()

router.get('/tickers', watchlistController.getAllUniqueTickers)

export default router