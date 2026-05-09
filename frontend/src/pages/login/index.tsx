import { useLogin } from '@/hooks/useLogin'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import styles from './login.module.css'

export function LoginPage() {
  const { error, isLoading, handleSubmit } = useLogin()

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.wordmark}>mktsum.</h1>
        <form onSubmit={handleSubmit} className={styles.fields}>
          <Input name="username" type="text" placeholder="username" />
          <Input name="password" type="password" placeholder="password" />
          {error && <p className={styles.error}>{error}</p>}
          <Button type="submit" loading={isLoading}>log in</Button>
        </form>
      </div>
    </div>
  )
}
