import { useAuth } from '@/hooks/useAuth'

export function HomePage() {
  const { data: user, dataUpdatedAt, refetch } = useAuth()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-2">
      <h1 className="text-3xl font-medium">mktsum.</h1>
      <p className="text-sm opacity-50">
        {user ? `hey, ${user.name}` : 'not logged in'}
      </p>
      <p className="text-xs opacity-30">
        last pull: {dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString() : '—'}
      </p>
      <button onClick={() => refetch()} className="text-xs opacity-40 underline cursor-pointer">
        refetch
      </button>
    </div>
  )
}
