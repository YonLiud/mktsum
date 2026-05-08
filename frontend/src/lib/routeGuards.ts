import { redirect } from '@tanstack/react-router'

export function requireAuth() {
  if (!localStorage.getItem('auth_user')) {
    throw redirect({ to: '/' })
  }
}
