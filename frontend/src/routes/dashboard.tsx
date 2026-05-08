import { createFileRoute } from '@tanstack/react-router'
import { DashboardPage } from '@/pages/DashboardPage'
import { requireAuth } from '@/lib/routeGuards'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: requireAuth,
  component: DashboardPage,
})
