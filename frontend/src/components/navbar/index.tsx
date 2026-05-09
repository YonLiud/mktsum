import { Link } from '@tanstack/react-router'
import { LayoutDashboard, BookMarked, User, Sun, Moon, Scale } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import styles from './navbar.module.css'

export function Navbar() {
  const { theme, toggle } = useTheme()

  return (
    <nav className={styles.nav}>
      <span className={styles.wordmark}>mktsum.</span>

      <div className={styles.links}>
        <Link to="/dashboard" className={styles.link}>
          <LayoutDashboard size={16} />
          dashboard
        </Link>
        <Link to="/watchlist" className={styles.link}>
          <BookMarked size={16} />
          watchlist
        </Link>
      </div>

      <div className={styles.footer}>
        <Link to="/profile" className={styles.link}>
          <User size={16} />
          profile
        </Link>
        <button className={styles.themeBtn} onClick={toggle}>
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          {theme === 'dark' ? 'light mode' : 'dark mode'}
        </button>
        <Link to="/legal" className={`${styles.link} ${styles.legalLink}`}>
          <Scale size={16} />
          legal
        </Link>
      </div>
    </nav>
  )
}
