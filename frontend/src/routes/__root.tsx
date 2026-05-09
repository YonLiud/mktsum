import { createRootRoute, Outlet, useRouterState } from '@tanstack/react-router'
import { Navbar } from '@/components/navbar'
import { EmptyState } from '@/components/ui/empty-state'
import { useAuth } from '@/hooks/useAuth'
import styles from './root.module.css'

const NO_NAV = ['/', '/login', '/signup']

function isNoNav(path: string) {
  return NO_NAV.includes(path) || path.startsWith('/legal')
}

function NotFound() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '80px 16px' }}>
      <EmptyState title="page not found" description="this page doesn't exist." />
    </div>
  )
}

export const Route = createRootRoute({
  notFoundComponent: NotFound,
  component: () => {
    const { location } = useRouterState()
    const { data: user } = useAuth()
    const showNav = !isNoNav(location.pathname) && !!user

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
