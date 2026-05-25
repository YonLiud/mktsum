import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Turnstile } from '@marsidev/react-turnstile'
import { useRegister } from '@/hooks/useRegister'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import styles from '../login/login.module.css'

export function SignupPage() {
  const [token, setToken] = useState<string | null>(null)
  const { error, isLoading, handleSubmit } = useRegister(token)
  const [agreed, setAgreed] = useState(false)

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.wordmark}>mktsum.</h1>
        <form onSubmit={handleSubmit} className={styles.fields}>
          <Input name="name" type="text" placeholder="display name" autoComplete="name" />
          <Input name="username" type="text" placeholder="username" autoComplete="username" />
          <Input name="password" type="password" placeholder="password" autoComplete="new-password" />
          <Input name="ntfy_topic" type="text" placeholder="ntfy topic (optional)" />
          <Checkbox checked={agreed} onChange={setAgreed}>
            I agree to the <Link to="/legal/terms" className={styles.termsLink} target="_blank">terms</Link> &amp; <Link to="/legal/disclaimer" className={styles.termsLink} target="_blank">disclaimer</Link>
          </Checkbox>
          <Turnstile
            siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
            onSuccess={setToken}
            onExpire={() => setToken(null)}
            options={{ theme: 'auto' }}
          />
          {error && <p className={styles.error}>{error}</p>}
          <Button type="submit" loading={isLoading} disabled={!agreed || !token}>create account</Button>
        </form>
        <p className={styles.switch}>
          already have an account? <Link to="/login" className={styles.switchLink}>log in</Link>
        </p>
      </div>
    </div>
  )
}
