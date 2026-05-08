import { Link } from '@tanstack/react-router'
import { useAuth } from '@/hooks/useAuth'
import { useLogout } from '@/hooks/useLogout'

export function Navbar() {
  const { data: user } = useAuth()
  const logout = useLogout()

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b">
      <div className="flex items-center gap-6">
        <span className="text-sm font-medium">mktsum.</span>
        {user && (
          <nav className="flex items-center gap-4">
            <Link to="/dashboard" className="text-sm opacity-60 hover:opacity-100 transition-opacity [&.active]:opacity-100 [&.active]:font-medium">
              dashboard
            </Link>
            <Link to="/watchlist" className="text-sm opacity-60 hover:opacity-100 transition-opacity [&.active]:opacity-100 [&.active]:font-medium">
              watchlist
            </Link>
          </nav>
        )}
      </div>
      <div className="flex items-center gap-4">
        {user && <span className="text-sm opacity-60">{user.name}</span>}
        {user && (
          <button onClick={logout} className="text-xs opacity-40 underline cursor-pointer">
            log out
          </button>
        )}
      </div>
    </div>
  )
}
