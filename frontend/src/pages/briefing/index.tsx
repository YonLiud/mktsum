import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Route } from '@/routes/briefings/$briefingId'
import { useBriefing, useSetBriefingPublic, useDeleteBriefing, BriefingError } from '@/hooks/useBriefings'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Divider } from '@/components/ui/divider'
import { TickerPill } from '@/components/ui/ticker-pill'
import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import styles from './briefing.module.css'

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  }).toLowerCase()
}

function uniqueTickers(sources: { ticker: string }[]) {
  return [...new Set(sources.map(s => s.ticker))]
}

export function BriefingPage() {
  const { briefingId } = Route.useParams()
  const { data: briefing, isLoading, isError, error } = useBriefing(briefingId)
  const { mutate: setPublic, status: mutationStatus } = useSetBriefingPublic()
  const { mutate: deleteBriefing, isPending: isDeleting } = useDeleteBriefing()
  const { data: user } = useAuth()
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)
  const isUpdating = mutationStatus === 'pending'
  const isOwner = !!user && briefing?.user_id === user.user_id

  function goBack() {
    if (window.history.length > 1) {
      window.history.back()
    } else {
      navigate({ to: '/dashboard' })
    }
  }

  function copyShareLink() {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isLoading) return (
    <div className={styles.page}>
      <button className={styles.back} onClick={goBack}>← back</button>
      <div className={styles.header}>
        <Skeleton height="10px" width="120px" />
        <Skeleton height="32px" width="90%" />
        <Skeleton height="32px" width="55%" />
      </div>
      <Divider />
      <div className={styles.skeletonBody}>
        <Skeleton height="15px" />
        <Skeleton height="15px" />
        <Skeleton height="15px" />
        <Skeleton height="15px" width="80%" />
        <Skeleton height="15px" />
        <Skeleton height="15px" width="65%" />
      </div>
    </div>
  )

  if (isError) {
    const status = error instanceof BriefingError ? error.status : 0
    return (
      <div className={styles.page}>
        <button className={styles.back} onClick={goBack}>← back</button>
        <EmptyState
          title={status === 403 ? 'access denied' : status === 404 ? 'not found' : 'something went wrong'}
          description={
            status === 403 ? "you don't have access to this briefing."
            : status === 404 ? 'this briefing does not exist.'
            : 'try again later.'
          }
        />
      </div>
    )
  }

  if (!briefing) return null

  const tickers = briefing.sources ? uniqueTickers(briefing.sources) : []

  return (
    <div className={styles.page}>

      <button className={styles.back} onClick={goBack}>← back</button>

      <div className={styles.header}>
        <p className={styles.eyebrow}>briefing · {formatDate(briefing.created_at)}</p>
        <h1 className={styles.title}>{briefing.short_summary}</h1>
      </div>

      <Divider />

      <p className={`${styles.body} selectable`}>{briefing.full_summary}</p>

      {tickers.length > 0 && (
        <>
          <Divider />
          <div className={styles.tickers}>
            {tickers.map(t => <TickerPill key={t} symbol={t} />)}
          </div>
        </>
      )}

      {briefing.sources && briefing.sources.length > 0 && (
        <>
          <Divider />
          <div className={styles.sources}>
            <p className={styles.sectionLabel}>sources</p>
            {briefing.sources.map((s, i) => (
              <a
                key={i}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.sourceItem}
              >
                <TickerPill symbol={s.ticker} />
                <span className={styles.sourceTitle}>{s.title}</span>
                <svg className={styles.externalIcon} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            ))}
          </div>
        </>
      )}

      {!user && (
        <>
          <Divider />
          <p className={styles.publicFooter}>
            <Link to="/legal">legal & policies</Link>
          </p>
        </>
      )}

      {isOwner && (
        <>
          <Divider />
          <div className={styles.actions}>
            <Button
              variant="ghost"
              size="sm"
              loading={isUpdating}
              onClick={() => setPublic({ id: briefing.briefing_id, isPublic: !briefing.is_public })}
            >
              {briefing.is_public ? 'make private' : 'make public'}
            </Button>
            {briefing.is_public && (
              <Button
                variant="secondary"
                size="sm"
                onClick={copyShareLink}
              >
                {copied ? 'copied!' : 'copy link'}
              </Button>
            )}
            <Button
              variant="danger"
              size="sm"
              loading={isDeleting}
              onClick={() => deleteBriefing(briefing.briefing_id, { onSuccess: () => navigate({ to: '/dashboard' }) })}
            >
              delete
            </Button>
          </div>
        </>
      )}

    </div>
  )
}
