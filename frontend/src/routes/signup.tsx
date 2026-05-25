import { createFileRoute, redirect } from '@tanstack/react-router'
import { SignupPage } from '@/pages/signup'

export const Route = createFileRoute('/signup')({
  head: () => ({ meta: [{ title: 'Sign up — mktsum' }] }),
  beforeLoad: () => {
    const stored = localStorage.getItem('auth_user')
    if (stored) throw redirect({ to: '/dashboard' })
  },
  component: SignupPage,
})
