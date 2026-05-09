import { Link } from '@tanstack/react-router'
import { LayoutDashboard, BookMarked, User, LogOut } from 'lucide-react'
import { useLogout } from '@/hooks/useLogout'
import styles from './navbar.module.css'

export function Navbar() {
  const logout = useLogout()

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
        <button className={styles.logout} onClick={logout}>
          <LogOut size={16} />
          log out
        </button>
      </div>
    </nav>
  )
}
