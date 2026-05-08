import { createFileRoute, redirect } from '@tanstack/react-router'
import { ProfilePage } from '@/pages/ProfilePage'

export const Route = createFileRoute('/profile')({
  beforeLoad: () => {
    if(!localStorage.getItem('auth_user')) {
      throw redirect({to: '/'})
    }
  },
  component: ProfilePage
})
