import { createFileRoute } from '@tanstack/react-router'
import { DashboardPage } from '@/pages/dashboard'
import { requireAuth } from '@/lib/routeGuards'

export const Route = createFileRoute('/dashboard')({
  head: () => ({ meta: [{ title: 'Dashboard — mktsum' }] }),
  beforeLoad: requireAuth,
  component: DashboardPage,
})
