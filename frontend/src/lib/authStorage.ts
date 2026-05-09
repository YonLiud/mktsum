export type AuthUser = {
  user_id: string
  username: string
  name: string
  role: string
  ntfy_topic?: string
}

const KEY = 'auth_user'

export function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setStoredUser(user: AuthUser): void {
  localStorage.setItem(KEY, JSON.stringify(user))
}

export function clearAuthStorage(): void {
  localStorage.removeItem(KEY)
}
