import { createFileRoute } from '@tanstack/react-router'
import { DashboardPage } from '@/pages/dashboard'
import { requireAuth } from '@/lib/routeGuards'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: requireAuth,
  component: DashboardPage,
})
