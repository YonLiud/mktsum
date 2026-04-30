import { useState } from 'react'
import type { ComponentProps } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { api } from '@/lib/api'
import { useSetAuth } from '@/hooks/useAuth'

type FormSubmitHandler = NonNullable<ComponentProps<'form'>['onSubmit']>

export function useLogin() {
  const navigate = useNavigate()
  const setAuth = useSetAuth()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit: FormSubmitHandler = async (e) => {
    e.preventDefault()
    setError(null)

    const data = new FormData(e.currentTarget as HTMLFormElement)
    const username = (data.get('username') as string).trim()
    const password = (data.get('password') as string).trim()

    if (!username || !password) {
      setError('Username and password are required.')
      return
    }

    setIsLoading(true)
    const res = await api.post('/v1/auth/login', { username, password })
    setIsLoading(false)

    if (!res.ok) {
      setError('Invalid username or password.')
      return
    }

    const user = await res.json()
    setAuth(user)
    navigate({ to: '/' })
  }

  return { error, isLoading, handleSubmit }
}
