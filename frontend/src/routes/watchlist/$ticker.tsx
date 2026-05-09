import { createFileRoute } from '@tanstack/react-router'
import { TickerPage } from '@/pages/watchlist/ticker'
import { requireAuth } from '@/lib/routeGuards'

export const Route = createFileRoute('/watchlist/$ticker')({
  beforeLoad: requireAuth,
  component: TickerPage,
})
