import { createFileRoute, redirect } from '@tanstack/react-router'
import { HomePage } from '@/pages/home'

export const Route = createFileRoute('/')({
  head: () => ({ meta: [{ title: 'mktsum' }] }),
  beforeLoad: () => {
    const stored = localStorage.getItem('auth_user')
    if (stored) throw redirect({ to: '/dashboard' })
  },
  component: HomePage,
})
