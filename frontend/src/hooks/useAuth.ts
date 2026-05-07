import { useQuery, useQueryClient } from '@tanstack/react-query'

export type AuthUser = {
  user_id: string
  username: string
  name: string
  role: string
  ntfy_topic? :string
}

const AUTH_KEY = ['auth']

export function clearAuthStorage() {
  localStorage.removeItem('auth_user')
}

function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem('auth_user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function useAuth() {
  return useQuery({
    queryKey: AUTH_KEY,
    queryFn: getStoredUser,
    staleTime: Infinity,
  })
}

export function useSetAuth() {
  const queryClient = useQueryClient()
  return (user: AuthUser) => {
    localStorage.setItem('auth_user', JSON.stringify(user))
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
