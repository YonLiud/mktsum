import { useAuth } from '@/hooks/useAuth'
import { useLogout } from '@/hooks/useLogout'

export function Navbar() {
  const { data: user } = useAuth()
  const logout = useLogout()

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b">
      <span className="text-sm font-medium">mktsum.</span>
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
