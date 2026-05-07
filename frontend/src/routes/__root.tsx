import { createRootRoute, Outlet, useRouterState } from '@tanstack/react-router'
import { Navbar } from '@/components/Navbar'

const NO_NAVBAR = ['/', '/login']

export const Route = createRootRoute({
  component: () => {
    const { location } = useRouterState()
    const showNavbar = !NO_NAVBAR.includes(location.pathname)
    return (
      <>
        {showNavbar && <Navbar />}
        <Outlet />
      </>
    )
  },
})
