import { Hono } from 'hono'
import { watchlistController } from '../../controllers/watchlist'

const router = new Hono()

router.get('/user/:userId', watchlistController.getByUserId)
router.post('/user/:userId', watchlistController.add)
router.delete('/:id', watchlistController.remove)
router.delete('/user/:userId/ticker', watchlistController.removeByTicker)

export default router