import { createFileRoute, redirect } from '@tanstack/react-router'
import { WatchlistPage } from '@/pages/WatchlistPage'

export const Route = createFileRoute('/watchlist')({
  beforeLoad: () => {
    if (!localStorage.getItem('auth_user')) {
      throw redirect({ to: '/' })
    }
  },
  component: WatchlistPage,
})
