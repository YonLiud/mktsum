import { createFileRoute, redirect } from '@tanstack/react-router'
import { HomePage } from '@/pages/home'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    const stored = localStorage.getItem('auth_user')
    if (stored) throw redirect({ to: '/dashboard' })
  },
  component: HomePage,
})
