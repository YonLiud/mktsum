import { useAuth } from '@/hooks/useAuth'

export function DashboardPage() {
  const { data: user } = useAuth()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-2">
      <h1 className="text-3xl font-medium">dashboard.</h1>
      <p className="text-sm opacity-50">hey, {user?.name}</p>
    </div>
  )
}
