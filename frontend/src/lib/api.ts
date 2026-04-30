import { queryClient } from './queryClient'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000'

async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (res.status === 401) {
    queryClient.setQueryData(['auth'], null)
    localStorage.removeItem('auth_user')
    window.location.href = '/login'
    return res
  }

  return res
}

export const api = {
  get: (path: string) => request(path),
  post: (path: string, body: unknown) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: (path: string, body: unknown) => request(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (path: string) => request(path, { method: 'DELETE' }),
}
