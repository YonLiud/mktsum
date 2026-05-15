import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '@/hooks/useAuth'
import { useBriefings, useLatestBriefing } from '@/hooks/useBriefings'
import { useWatchlist } from '@/hooks/useWatchlist'
import { Divider } from '@/components/ui/divider'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { TickerPill } from '@/components/ui/ticker-pill'
import { ListItem } from '@/components/ui/list-item'
import { Label } from '@/components/ui/label'
import { formatToday, formatTime, formatBriefingDate } from '@/lib/dateFormat'
import type { Briefing } from '@/types'
import styles from './dashboard.module.css'

function useNextBriefingCountdown() {
  const [countdown, setCountdown] = useState('')

  useEffect(() => {
    function nextRun() {
      const now = new Date()
      const target = new Date(now)
      target.setUTCHours(4, 0, 0, 0)
      if (now >= target) target.setUTCDate(target.getUTCDate() + 1)
      return target
    }

    function format(ms: number) {
      const total = Math.max(0, Math.floor(ms / 1000))
      const h = Math.floor(total / 3600)
      const m = Math.floor((total % 3600) / 60)
      const s = total % 60
      if (h > 0) return `${h}h ${m}m ${s}s`
      return `${m}m and ${s}s`
    }

    const tick = () => setCountdown(format(nextRun().getTime() - Date.now()))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return countdown
}

function isToday(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  return d.getFullYear() === now.getFullYear()
    && d.getMonth() === now.getMonth()
    && d.getDate() === now.getDate()
}

const GREETINGS_MORNING = [
  (name: string) => `good morning, ${name}.`,
  (name: string) => `morning, ${name}.`,
  (name: string) => `early start, ${name}?`,
  (name: string) => `markets open soon, ${name}.`,
  (name: string) => `rise and grind, ${name}.`,
]

const GREETINGS_AFTERNOON = [
  (name: string) => `good afternoon, ${name}.`,
  (name: string) => `afternoon, ${name}.`,
  (name: string) => `how's the day treating you, ${name}?`,
  (name: string) => `keeping an eye on things, ${name}?`,
]

const GREETINGS_EVENING = [
  (name: string) => `good evening, ${name}.`,
  (name: string) => `winding down, ${name}?`,
  (name: string) => `markets are closed, ${name}. rest up.`,
  (name: string) => `evening, ${name}.`,
]

const GREETINGS_GENERAL = [
  (name: string) => `how are you, ${name}?`,
  (name: string) => `welcome back, ${name}.`,
  (name: string) => `hey, ${name}.`,
  (name: string) => `glad you're here, ${name}.`,
  (name: string) => `what's the plan, ${name}?`,
  (name: string) => `nice to see you, ${name}.`,
  (name: string) => `ready to check the markets, ${name}?`,
  (name: string) => `let's see what's moving, ${name}.`,
  (name: string) => `back again, ${name}.`,
  (name: string) => `your watchlist is waiting, ${name}.`,
]

function greeting(name: string) {
  const h = new Date().getHours()
  const timeBucket = h < 12 ? GREETINGS_MORNING : h < 17 ? GREETINGS_AFTERNOON : GREETINGS_EVENING
  const pool = [...timeBucket, ...GREETINGS_GENERAL]
  return pool[Math.floor(Math.random() * pool.length)](name)
}

const WAITING_TEMPLATES = [
  (t: string) => `almost time. ready in ${t}.`,
  (t: string) => `brewing. ready in ${t}.`,
  (t: string) => `your briefing arrives in ${t}.`,
  (t: string) => `your day starts in ${t}.`,
  (t: string) => `still cooking. ready in ${t}.`,
  (t: string) => `morning read ready in ${t}.`,
  (t: string) => `come back in ${t}.`,
  (t: string) => `crunching numbers. back in ${t}.`,
  (t: string) => `your briefing is ${t} away.`,
  (t: string) => `markets open soon. briefing in ${t}.`,
]

function tickers(b: Briefing) {
  return [...new Set(b.sources?.map(s => s.ticker) ?? [])]
}

export function DashboardPage() {
  const navigate = useNavigate()
  const { data: user } = useAuth()
  const { data: latest, isLoading: latestLoading } = useLatestBriefing()
  const { data: allBriefings } = useBriefings()
  const { data: watchlist } = useWatchlist()
  const countdown = useNextBriefingCountdown()
  const greetingText = useMemo(() => greeting(user?.name ?? ''), [user?.name])
  const waitingTemplate = useMemo(
    () => WAITING_TEMPLATES[Math.floor(Math.random() * WAITING_TEMPLATES.length)],
    [],
  )

  const todaysBriefing = latest && isToday(latest.created_at) ? latest : null
  const past = (allBriefings ?? [])
    .filter(b => b.briefing_id !== todaysBriefing?.briefing_id)
    .slice(0, 3)
  const hasMore = (allBriefings?.length ?? 0) - (todaysBriefing ? 1 : 0) > 3

  return (
    <div className={styles.page}>

      {/* page header */}
      <div>
        <p className={styles.greeting}>{greetingText}</p>
        <p className={styles.meta}>
          {formatToday()} · {watchlist?.length ?? 0} ticker{watchlist?.length === 1 ? '' : 's'} tracked
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
            <p className={styles.cardTitle}>{todaysBriefing.subject ?? todaysBriefing.short_summary}</p>
          </div>
          <div className={`${styles.cardBody} selectable`}>
            <p className={styles.preview}>{todaysBriefing.short_summary}</p>
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
      ) : watchlist !== undefined && watchlist.length === 0 ? (
        <EmptyState
          title="no briefing yet"
          description="add tickers to your watchlist and your first briefing will arrive the next morning."
        />
      ) : (
        <EmptyState
          title="not ready yet"
          description={waitingTemplate(countdown)}
        />
      )}

      {/* past briefings */}
      {past.length > 0 && (
        <>
          <Divider />
          <div>
            <Label>past briefings</Label>
            {past.map(b => (
              <ListItem
                key={b.briefing_id}
                onClick={() => navigate({ to: '/briefings/$briefingId', params: { briefingId: b.briefing_id } })}
              >
                <div className={styles.briefingContent}>
                  <span className={styles.briefingTitle}>{formatBriefingDate(b.created_at)}</span>
                  <span className={styles.briefingSubtitle}>{b.subject ?? b.short_summary}</span>
                </div>
              </ListItem>
            ))}
            {hasMore && (
              <button
                className={styles.viewAll}
                onClick={() => navigate({ to: '/briefings/all' })}
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
