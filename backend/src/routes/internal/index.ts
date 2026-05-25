import { Hono } from 'hono'
import usersRoutes from './users'
import briefingsRoutes from './briefings'
import watchlistRoutes from './watchlist'
import tickersRoutes from './tickers'

const internalRoutes = new Hono()

internalRoutes.route('/users', usersRoutes)
internalRoutes.route('/briefings', briefingsRoutes)
internalRoutes.route('/watchlist', watchlistRoutes)
internalRoutes.route('/tickers', tickersRoutes)

export { internalRoutes }