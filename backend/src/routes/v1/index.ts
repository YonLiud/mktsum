import { Hono } from 'hono'
import usersRoutes from './users'
import briefingsRoutes from './briefings'
import watchlistRoutes from './watchlist'

const v1Routes = new Hono()

v1Routes.route('/users', usersRoutes)
v1Routes.route('/briefings', briefingsRoutes)
v1Routes.route('/watchlist', watchlistRoutes)

export { v1Routes }