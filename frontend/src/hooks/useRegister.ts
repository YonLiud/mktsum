import { useState } from 'react'
import type { ComponentProps } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { api } from '@/lib/api'
import { useSetAuth } from '@/hooks/useAuth'

type FormSubmitHandler = NonNullable<ComponentProps<'form'>['onSubmit']>

export function useRegister() {
  const navigate = useNavigate()
  const setAuth = useSetAuth()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit: FormSubmitHandler = async (e) => {
    e.preventDefault()
    setError(null)

    const data = new FormData(e.currentTarget as HTMLFormElement)
    const username = (data.get('username') as string).trim()
    const name = (data.get('name') as string).trim()
    const password = (data.get('password') as string).trim()
    const ntfy_topic = (data.get('ntfy_topic') as string).trim()

    if (!username || !name || !password) {
      setError('Username, name, and password are required.')
      return
    }

    setIsLoading(true)
    const res = await api.post('/users', { username, name, password, ntfy_topic: ntfy_topic || undefined })
    setIsLoading(false)

    if (!res.ok) {
      const body = await res.json().catch(() => null)
      setError(body?.error?.formErrors?.[0] ?? body?.error ?? 'Registration failed.')
      return
    }

    const loginRes = await api.post('/auth/login', { username, password })
    if (!loginRes.ok) {
      navigate({ to: '/login' })
      return
    }

    const { token, ...user } = await loginRes.json()
    localStorage.setItem('auth_token', token)
    setAuth(user)
    navigate({ to: '/' })
  }

  return { error, isLoading, handleSubmit }
}
