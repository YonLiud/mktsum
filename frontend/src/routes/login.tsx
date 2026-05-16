import { createFileRoute, redirect } from '@tanstack/react-router'
import { LoginPage } from '@/pages/login'

export const Route = createFileRoute('/login')({
  head: () => ({ meta: [{ title: 'Login — mktsum' }] }),
  beforeLoad: () => {
    const stored = localStorage.getItem('auth_user')
    if (stored) throw redirect({ to: '/dashboard' })
  },
  component: LoginPage,
})
