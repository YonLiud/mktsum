import { createFileRoute, redirect } from '@tanstack/react-router'
import { DashboardPage } from '@/pages/DashboardPage'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: () => {
    if (!localStorage.getItem('auth_user')) {
      throw redirect({ to: '/'}) 
    }
  },
  component: DashboardPage,
})
