import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '@/hooks/useAuth'
import { useBriefings, useLatestBriefing } from '@/hooks/useBriefings'
import { useWatchlist } from '@/hooks/useWatchlist'
import { Divider } from '@/components/ui/divider'
import { Spinner } from '@/components/ui/spinner'
import { Skeleton } from '@/components/ui/skeleton'
import { TickerPill } from '@/components/ui/ticker-pill'
import type { Briefing } from '@/types'
import styles from './dashboard.module.css'

function isToday(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  return d.getFullYear() === now.getFullYear()
    && d.getMonth() === now.getMonth()
    && d.getDate() === now.getDate()
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'good morning'
  if (h < 17) return 'good afternoon'
  return 'good evening'
}

function formatDate() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  }).toLowerCase()
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit',
  }).toLowerCase()
}

function formatBriefingDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric',
  }).toLowerCase() + ' briefing'
}

function tickers(b: Briefing) {
  return [...new Set(b.sources?.map(s => s.ticker) ?? [])]
}

export function DashboardPage() {
  const navigate = useNavigate()
  const { data: user } = useAuth()
  const { data: latest, isLoading: latestLoading } = useLatestBriefing()
  const { data: allBriefings, isLoading: briefingsLoading } = useBriefings()
  const { data: watchlist } = useWatchlist()

  const todaysBriefing = latest && isToday(latest.created_at) ? latest : null
  const past = (allBriefings ?? [])
    .filter(b => b.briefing_id !== todaysBriefing?.briefing_id)
    .slice(0, 3)
  const hasMore = (allBriefings?.length ?? 0) - (todaysBriefing ? 1 : 0) > 3

  return (
    <div className={styles.page}>

      {/* page header */}
      <div>
        <p className={styles.greeting}>{greeting()}, {user?.name}.</p>
        <p className={styles.meta}>
          {formatDate()} · {watchlist?.length ?? 0} ticker{watchlist?.length === 1 ? '' : 's'} tracked
        </p>
      </div>

      <Divider />

      {/* today's briefing */}
      {latestLoading ? (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Skeleton variant="dark" height="10px" width="80px" />
            <Skeleton variant="dark" height="18px" width="90%" />
            <Skeleton variant="dark" height="18px" width="60%" />
          </div>
          <div className={styles.cardBody}>
            <Skeleton height="13px" />
            <Skeleton height="13px" />
            <Skeleton height="13px" width="70%" />
          </div>
        </div>
      ) : todaysBriefing ? (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <p className={styles.eyebrow}>today's briefing</p>
            <p className={styles.cardTitle}>{todaysBriefing.short_summary}</p>
          </div>
          <div className={`${styles.cardBody} selectable`}>
            <p className={styles.preview}>{todaysBriefing.full_summary}</p>
            {tickers(todaysBriefing).length > 0 && (
              <div className={styles.tickers}>
                {tickers(todaysBriefing).map(t => <TickerPill key={t} symbol={t} />)}
              </div>
            )}
            <div className={styles.cardFooter}>
              <span className={styles.generatedAt}>
                generated {formatTime(todaysBriefing.created_at)}
              </span>
              <button
                className={styles.readMore}
                onClick={() => navigate({ to: '/briefings/$briefingId', params: { briefingId: todaysBriefing.briefing_id } })}
              >
                read full briefing →
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.generating}>
          <Spinner size="sm" />
          <p className={styles.generatingLabel}>briefing generating...</p>
        </div>
      )}

      {/* past briefings */}
      {past.length > 0 && (
        <>
          <Divider />
          <div>
            <p className={styles.sectionLabel}>past briefings</p>
            {past.map(b => (
              <button
                key={b.briefing_id}
                className={styles.briefingRow}
                onClick={() => navigate({ to: '/briefings/$briefingId', params: { briefingId: b.briefing_id } })}
              >
                <div>
                  <p className={styles.rowDate}>{formatBriefingDate(b.created_at)}</p>
                  <p className={styles.rowSubtitle}>{b.short_summary}</p>
                </div>
                <svg className={styles.chevron} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            ))}
            {hasMore && (
              <button
                className={styles.viewAll}
                onClick={() => navigate({ to: '/briefings/$briefingId', params: { briefingId: 'all' } })}
              >
                view all →
              </button>
            )}
          </div>
        </>
      )}

    </div>
  )
}
