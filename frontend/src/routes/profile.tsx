import { createFileRoute } from '@tanstack/react-router'
import { ProfilePage } from '@/pages/ProfilePage'
import { requireAuth } from '@/lib/routeGuards'

export const Route = createFileRoute('/profile')({
  beforeLoad: requireAuth,
  component: ProfilePage,
})
