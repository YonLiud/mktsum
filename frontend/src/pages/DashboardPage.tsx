import { Link } from '@tanstack/react-router'
import { useAuth } from '@/hooks/useAuth'
import { useLatestBriefing } from '@/hooks/useBriefings'

export function DashboardPage() {
  const { data: user } = useAuth()
  const { data: briefing } = useLatestBriefing()

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-medium">dashboard.</h1>
        <p className="text-sm opacity-50 mt-1">hey, {user?.name}</p>
      </div>

      {briefing && (
        <div className="flex flex-col gap-2">
          <p className="text-xs opacity-40 uppercase tracking-widest">Latest briefing</p>
          <Link
            to="/briefings/$briefingId"
            params={{ briefingId: briefing.briefing_id }}
            className="border border-current/10 rounded-lg p-4 hover:bg-current/5 transition-colors"
          >
            <p className="font-medium">{briefing.short_summary}</p>
          </Link>
        </div>
      )}
    </div>
  )
}
