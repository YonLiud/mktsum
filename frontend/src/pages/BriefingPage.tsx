import { Route } from '@/routes/briefings/$briefingId'
import { useBriefing, useSetBriefingPublic } from '@/hooks/useBriefings'

export function BriefingPage() {
  const { briefingId } = Route.useParams()
  const { data: briefing, isLoading, isError } = useBriefing(briefingId)
  const { mutate: setPublic, status: mutationStatus } = useSetBriefingPublic()
  const isUpdating = mutationStatus === 'pending'

  if (isLoading) return <div>Loading...</div>
  if (isError || !briefing) return <div>Briefing not found.</div>

  return (
    <div>
      <div>
        <h1>{briefing.short_summary}</h1>
        <p>{new Date(briefing.created_at).toLocaleString()}</p>
        <button
          onClick={() => setPublic({ id: briefing.briefing_id, isPublic: !briefing.is_public })}
          disabled={isUpdating}
          style={{ cursor: isUpdating ? 'wait' : 'pointer' }}
        >
          {isUpdating ? 'updating...' : briefing.is_public ? 'make private' : 'make public'}
        </button>
      </div>
      <p>{briefing.full_summary}</p>
      {briefing.sources && briefing.sources.length > 0 && (
        <details>
          <summary>Sources ({briefing.sources.length})</summary>
          <ul>
            {briefing.sources.map((s, i) => (
              <li key={i}>
                <span>{s.ticker}</span>
                {' — '}
                <a href={s.url} target="_blank" rel="noopener noreferrer">{s.title}</a>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  )
}
