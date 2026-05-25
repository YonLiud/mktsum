import { createFileRoute } from '@tanstack/react-router'
import { WatchlistPage } from '@/pages/watchlist'
import { requireAuth } from '@/lib/routeGuards'

export const Route = createFileRoute('/watchlist/')({
  head: () => ({ meta: [{ title: 'Watchlist — mktsum' }] }),
  beforeLoad: requireAuth,
  component: WatchlistPage,
})
