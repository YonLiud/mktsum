import { createFileRoute } from '@tanstack/react-router'
import { TickerPage } from '@/pages/watchlist/ticker'
import { requireAuth } from '@/lib/routeGuards'

export const Route = createFileRoute('/watchlist/$ticker')({
  head: ({ params }) => ({ meta: [{ title: `${params.ticker.toUpperCase()} — mktsum` }] }),
  beforeLoad: requireAuth,
  component: TickerPage,
})
