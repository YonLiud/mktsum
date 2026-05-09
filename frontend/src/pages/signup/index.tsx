import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useRegister } from '@/hooks/useRegister'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import styles from '../login/login.module.css'

export function SignupPage() {
  const { error, isLoading, handleSubmit } = useRegister()
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
          <label className={styles.terms}>
            <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} />
            I agree to the{' '}
            <Link to="/legal/terms" className={styles.termsLink} target="_blank">Terms of Service</Link>
            {' '}and{' '}
            <Link to="/legal/disclaimer" className={styles.termsLink} target="_blank">Financial Disclaimer</Link>
          </label>
          {error && <p className={styles.error}>{error}</p>}
          <Button type="submit" loading={isLoading} disabled={!agreed}>create account</Button>
        </form>
        <p className={styles.switch}>
          already have an account? <Link to="/login" className={styles.switchLink}>log in</Link>
        </p>
      </div>
    </div>
  )
}
