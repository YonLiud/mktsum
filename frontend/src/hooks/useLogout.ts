import { useNavigate } from '@tanstack/react-router'
import { api } from '@/lib/api'
import { useClearAuth } from '@/hooks/useAuth'

export function useLogout() {
  const navigate = useNavigate()
  const clearAuth = useClearAuth()

  return () => {
    clearAuth()
    navigate({ to: '/' })
    api.post('/auth/logout', {}).catch(() => {})
  }
}
