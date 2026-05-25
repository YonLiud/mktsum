import { useNavigate } from '@tanstack/react-router'
// import { useTheme } from '@/hooks/useTheme'
import { Button } from '@/components/ui/button'
import styles from './home.module.css'

export function HomePage() {
  // const { theme, toggle } = useTheme()
  const navigate = useNavigate()

  return (
    <div className={styles.page}>

      <div className={styles.topRight}>
        {/* <Button variant="ghost" size="sm" onClick={toggle}>
          {theme === 'dark' ? 'light' : 'dark'}
        </Button> */}
        <Button variant='ghost' size='sm' onClick={() => navigate({to: '/login'})}>
          Login
        </Button>
      </div>

      <div className={styles.inner}>
        <h1 className={styles.wordmark}>mktsum.</h1>
        <p className={styles.tagline}>
          ai-powered market briefings. <br />
          stay ahead of your watchlist.
        </p>
        <Button className={styles.cta} onClick={() => navigate({ to: '/signup' })}>
          get started
        </Button>
      </div>

    </div>
  )
}
