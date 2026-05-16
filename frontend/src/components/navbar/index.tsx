import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { LayoutDashboard, BookMarked, User, Sun, Moon, Scale, Coffee, Bell, Menu, X } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import styles from './navbar.module.css'

export function Navbar() {
  const { theme, toggle } = useTheme()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const closeDrawer = () => setDrawerOpen(false)

  return (
    <>
      <nav className={styles.nav}>
        <span className={styles.wordmark}>mktsum.</span>

        <div className={styles.links}>
          <Link to="/dashboard" className={styles.link} onClick={closeDrawer}>
            <LayoutDashboard size={16} />
            dashboard
          </Link>
          <Link to="/watchlist" className={styles.link} onClick={closeDrawer}>
            <BookMarked size={16} />
            watchlist
          </Link>
        </div>

        <Link to="/ntfy" className={styles.ntfyLink}>
          <Bell size={16} />
          notifications
        </Link>

        <a
          href="https://ko-fi.com/C4W21ZNE8V"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.donateBtn}
        >
          <Coffee size={16} />
          buy me a coffee
        </a>

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

        <button
          className={styles.burgerBtn}
          onClick={() => setDrawerOpen(o => !o)}
        >
          {drawerOpen ? <X size={18} /> : <Menu size={18} />}
          {drawerOpen ? 'close' : 'more'}
        </button>
      </nav>

      {drawerOpen && (
        <div className={styles.overlay} onClick={closeDrawer} />
      )}

      <div className={`${styles.drawer} ${drawerOpen ? styles.drawerOpen : ''}`}>
        <Link to="/profile" className={styles.drawerItem} onClick={closeDrawer}>
          <User size={18} />
          profile
        </Link>
        <button className={styles.drawerItem} onClick={() => { toggle(); closeDrawer() }}>
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          {theme === 'dark' ? 'light mode' : 'dark mode'}
        </button>
        <Link to="/ntfy" className={styles.drawerItem} onClick={closeDrawer}>
          <Bell size={18} />
          notifications
        </Link>
        <a
          href="https://ko-fi.com/C4W21ZNE8V"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.drawerItem}
          onClick={closeDrawer}
        >
          <Coffee size={18} />
          buy me a coffee
        </a>
        <Link to="/legal" className={styles.drawerItem} onClick={closeDrawer}>
          <Scale size={18} />
          legal
        </Link>
      </div>
    </>
  )
}
