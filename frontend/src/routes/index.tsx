import { createFileRoute, redirect } from '@tanstack/react-router'
import { HomePage } from '@/pages/HomePage'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    if (localStorage.getItem('auth_user')) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: HomePage,
})
