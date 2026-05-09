import { Link } from '@tanstack/react-router'
import { useRegister } from '@/hooks/useRegister'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import styles from '../login/login.module.css'

export function SignupPage() {
  const { error, isLoading, handleSubmit } = useRegister()

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.wordmark}>mktsum.</h1>
        <form onSubmit={handleSubmit} className={styles.fields}>
          <Input name="name" type="text" placeholder="display name" autoComplete="name" />
          <Input name="username" type="text" placeholder="username" autoComplete="username" />
          <Input name="password" type="password" placeholder="password" autoComplete="new-password" />
          <Input name="ntfy_topic" type="text" placeholder="ntfy topic (optional)" />
          {error && <p className={styles.error}>{error}</p>}
          <Button type="submit" loading={isLoading}>create account</Button>
        </form>
        <p className={styles.switch}>
          already have an account? <Link to="/login" className={styles.switchLink}>log in</Link>
        </p>
      </div>
    </div>
  )
}
