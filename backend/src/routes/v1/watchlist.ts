import { Hono } from 'hono'
import { watchlistController } from '../../controllers/watchlist'
import { requireAuth, requireSelf } from '../../middleware/auth'

const router = new Hono()

router.get('/user/:userId', requireAuth, requireSelf('userId'), watchlistController.getByUserId)
router.post('/user/:userId', requireAuth, requireSelf('userId'), watchlistController.add)
router.delete('/:id', requireAuth, watchlistController.remove)
router.delete('/user/:userId/ticker', requireAuth, requireSelf('userId'), watchlistController.removeByTicker)

export default router
