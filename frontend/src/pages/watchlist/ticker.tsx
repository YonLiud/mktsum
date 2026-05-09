import { useNavigate } from '@tanstack/react-router'
import { Route } from '@/routes/watchlist/$ticker'
import { useTicker } from '@/hooks/useTicker'
import { useWatchlist, useRemoveTicker } from '@/hooks/useWatchlist'
import { TickerPill } from '@/components/ui/ticker-pill'
import { Button } from '@/components/ui/button'
import { Divider } from '@/components/ui/divider'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import styles from './ticker.module.css'

export function TickerPage() {
  const { ticker: symbol } = Route.useParams()
  const navigate = useNavigate()
  const { data: ticker, isLoading, isError } = useTicker(symbol.toUpperCase())
  const { data: watchlist } = useWatchlist()
  const { mutate: removeTicker, isPending: isRemoving } = useRemoveTicker()

  const entry = watchlist?.find(e => e.ticker === symbol.toUpperCase())

  function goBack() {
    navigate({ to: '/watchlist' })
  }

  if (isLoading) return (
    <div className={styles.page}>
      <button className={styles.back} onClick={goBack}>← watchlist</button>
      <div className={styles.header}>
        <Skeleton height="22px" width="60px" />
        <Skeleton height="28px" width="180px" />
      </div>
      <Divider />
      <div className={styles.skeletonBody}>
        <Skeleton height="14px" />
        <Skeleton height="14px" />
        <Skeleton height="14px" />
        <Skeleton height="14px" width="75%" />
      </div>
    </div>
  )

  if (isError || !ticker) return (
    <div className={styles.page}>
      <button className={styles.back} onClick={goBack}>← watchlist</button>
      <EmptyState title="ticker not found" description="this ticker isn't in our database." />
    </div>
  )

  return (
    <div className={styles.page}>

      <button className={styles.back} onClick={goBack}>← watchlist</button>

      <div className={styles.header}>
        <TickerPill symbol={ticker.symbol} />
        <h1 className={styles.name}>{ticker.name}</h1>
      </div>

      <Divider />

      {ticker.description ? (
        <p className={styles.description}>{ticker.description}</p>
      ) : (
        <p className={styles.noDescription}>no description available.</p>
      )}

      {entry && (
        <>
          <Divider />
          <Button
            variant="danger"
            size="sm"
            loading={isRemoving}
            onClick={() => removeTicker(entry.watchlist_id, { onSuccess: goBack })}
          >
            remove from watchlist
          </Button>
        </>
      )}

    </div>
  )
}
