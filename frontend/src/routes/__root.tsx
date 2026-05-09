import { createRootRoute, Outlet, useRouterState } from '@tanstack/react-router'
import { Navbar } from '@/components/navbar'
import styles from './root.module.css'

const NO_NAV = ['/', '/login']

export const Route = createRootRoute({
  component: () => {
    const { location } = useRouterState()
    const showNav = !NO_NAV.includes(location.pathname)

    if (!showNav) {
      return (
        <div key={location.pathname} className="page-transition">
          <Outlet />
        </div>
      )
    }

    return (
      <div className={styles.layout}>
        <Navbar />
        <main className={styles.main}>
<div key={location.pathname} className="page-transition">
            <Outlet />
          </div>
        </main>
      </div>
    )
  },
})
