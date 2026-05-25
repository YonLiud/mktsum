import { useNavigate } from '@tanstack/react-router'
import { api } from '@/lib/api'
import { useClearAuth } from '@/hooks/useAuth'

export function useLogoutAll() {
  const navigate = useNavigate()
  const clearAuth = useClearAuth()

  return () => {
    api.post('/auth/logout-all', {}).catch(() => {})
    clearAuth()
    navigate({ to: '/' })
  }
}
