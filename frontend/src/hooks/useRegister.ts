import { useState } from 'react'
import type { ComponentProps } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { api } from '@/lib/api'
import { useSetAuth } from '@/hooks/useAuth'

type FormSubmitHandler = NonNullable<ComponentProps<'form'>['onSubmit']>

export function useRegister(turnstileToken: string | null) {
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

    if (!turnstileToken) {
      setError('Please complete the captcha.')
      return
    }

    setIsLoading(true)
    const res = await api.post('/users', { username, name, password, ntfy_topic: ntfy_topic || undefined, terms_accepted: true, turnstile_token: turnstileToken })
    setIsLoading(false)

    if (!res.ok) {
      const body = await res.json().catch(() => null)
      const err = body?.error
      let msg = 'Registration failed.'
      if (typeof err === 'string') {
        msg = err
      } else if (err?.formErrors?.[0]) {
        msg = err.formErrors[0]
      } else if (err?.fieldErrors) {
        const first = Object.values(err.fieldErrors).flat()[0]
        if (typeof first === 'string') msg = first
      }
      setError(msg)
      return
    }

    const loginRes = await api.post('/auth/login', { username, password })
    if (!loginRes.ok) {
      navigate({ to: '/login' })
      return
    }

    const user = await loginRes.json()
    setAuth(user)
    navigate({ to: '/dashboard' })
  }

  return { error, isLoading, handleSubmit }
}
