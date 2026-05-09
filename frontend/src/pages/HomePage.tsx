import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import styles from './home.module.css'

export function HomePage() {
  const [dark, setDark] = useState(false)
  const navigate = useNavigate()

  function toggleTheme() {
    setDark(d => {
      document.documentElement.classList.toggle('dark', !d)
      return !d
    })
  }

  return (
    <div className={styles.page}>

      <div className={styles.topRight}>
        <Button variant="ghost" size="sm" onClick={toggleTheme}>
          {dark ? 'light' : 'dark'}
        </Button>
      </div>

      <div className={styles.inner}>
        <h1 className={styles.wordmark}>mktsum.</h1>
        <p className={styles.tagline}>
          ai-powered market briefings,<br />
          delivered daily to your watchlist.
        </p>
        <Button className={styles.cta} onClick={() => navigate({ to: '/login' })}>
          log in
        </Button>
      </div>

    </div>
  )
}
