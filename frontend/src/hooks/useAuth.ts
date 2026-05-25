import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import {
  type AuthUser,
  getStoredUser,
  setStoredUser,
  clearAuthStorage,
} from '@/lib/authStorage'

export type { AuthUser }
export { clearAuthStorage }

const AUTH_KEY = ['auth']

async function fetchUser(): Promise<AuthUser | null> {
  const stored = getStoredUser()
  if (!stored) return null

  const res = await api.get(`/users/${stored.user_id}`)
  if (!res.ok) return stored

  const data = await res.json()
  const user: AuthUser = {
    user_id: data.user_id,
    username: data.username,
    name: data.name,
    role: data.role,
    ntfy_topic: data.ntfy_topic,
  }
  setStoredUser(user)
  return user
}

export function useAuth() {
  return useQuery({
    queryKey: AUTH_KEY,
    queryFn: fetchUser,
    staleTime: 0,
    refetchInterval: 10_000,
    initialData: getStoredUser,
  })
}

export function useSetAuth() {
  const queryClient = useQueryClient()
  return (user: AuthUser) => {
    setStoredUser(user)
    queryClient.setQueryData(AUTH_KEY, user)
  }
}

export function useClearAuth() {
  const queryClient = useQueryClient()
  return () => {
    clearAuthStorage()
    queryClient.setQueryData(AUTH_KEY, null)
  }
}
