import { createFileRoute, redirect } from '@tanstack/react-router'
import { DashboardPage } from '@/pages/DashboardPage'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: () => {
    if (!localStorage.getItem('auth_token')) {
      throw redirect({ to: '/'}) 
    }
  },
  component: DashboardPage,
})
