import { useNavigate } from '@tanstack/react-router'
import { Route } from '@/routes/briefings/$briefingId'
import { useBriefing, useSetBriefingPublic, useDeleteBriefing, BriefingError } from '@/hooks/useBriefings'
import { useAuth } from '@/hooks/useAuth'

export function BriefingPage() {
  const { briefingId } = Route.useParams()
  const { data: briefing, isLoading, isError, error } = useBriefing(briefingId)
  const { mutate: setPublic, status: mutationStatus } = useSetBriefingPublic()
  const { mutate: deleteBriefing, isPending: isDeleting } = useDeleteBriefing()
  const { data: user } = useAuth()
  const navigate = useNavigate()
  const isUpdating = mutationStatus === 'pending'
  const isOwner = !!user && briefing?.user_id === user.user_id

  if (isLoading) return <div>loading...</div>
  if (isError) {
    const status = error instanceof BriefingError ? error.status : 0
    if (status === 403) return <div>you don't have access to this briefing.</div>
    if (status === 404) return <div>briefing not found.</div>
    return <div>something went wrong.</div>
  }
  if (!briefing) return null

  return (
    <div>
      <div>
        <h1>{briefing.short_summary}</h1>
        <p>{new Date(briefing.created_at).toLocaleString()}</p>
        {isOwner && (
          <>
            <button
              onClick={() => setPublic({ id: briefing.briefing_id, isPublic: !briefing.is_public })}
              disabled={isUpdating}
              style={{ cursor: isUpdating ? 'wait' : 'pointer' }}
            >
              {isUpdating ? 'updating...' : briefing.is_public ? 'make private' : 'make public'}
            </button>
            <button
              onClick={() => deleteBriefing(briefing.briefing_id, { onSuccess: () => navigate({ to: '/dashboard' }) })}
              disabled={isDeleting}
              style={{ cursor: isDeleting ? 'wait' : 'pointer' }}
            >
              {isDeleting ? 'deleting...' : 'delete'}
            </button>
          </>
        )}
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
