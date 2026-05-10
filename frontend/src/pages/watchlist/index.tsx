import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useWatchlist, useAddTicker, useRemoveTicker } from '@/hooks/useWatchlist'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ListItem } from '@/components/ui/list-item'
import { TickerPill } from '@/components/ui/ticker-pill'
import { EmptyState } from '@/components/ui/empty-state'
import { Spinner } from '@/components/ui/spinner'
import { Divider } from '@/components/ui/divider'
import styles from './watchlist.module.css'

export function WatchlistPage() {
  const navigate = useNavigate()
  const { data: watchlist, isLoading } = useWatchlist()
  const { mutate: addTicker, isPending: isAdding, error: addError, reset } = useAddTicker()
  const { mutate: removeTicker } = useRemoveTicker()
  const [input, setInput] = useState('')

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const ticker = input.trim().toUpperCase()
    if (!ticker) return
    addTicker(ticker, {
      onSuccess: () => {
        setInput('')
        reset()
      },
    })
  }

  return (
    <div className={styles.page}>

      <div>
        <p className={styles.title}>watchlist.</p>
        <p className={styles.subtitle}>your tracked tickers</p>
      </div>

      <Divider />

      <form onSubmit={handleAdd} className={styles.addRow}>
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="ticker symbol"
          mono
          className={styles.addInput}
        />
        <Button
          type="submit"
          variant="secondary"
          loading={isAdding}
          disabled={!input.trim()}
        >
          add
        </Button>
      </form>

      {addError && (
        <p className={styles.error}>
          {(addError as Error).message.includes('Failed') ? 'ticker not found or already on watchlist.' : (addError as Error).message}
        </p>
      )}

      <Divider />

      {isLoading ? (
        <div className={styles.center}>
          <Spinner size="sm" />
        </div>
      ) : !watchlist?.length ? (
        <EmptyState
          title="no tickers yet"
          description="add a ticker above to start tracking it."
        />
      ) : (
        <div className={styles.list}>
          <p className={styles.sectionLabel}>
            {watchlist.length} ticker{watchlist.length === 1 ? '' : 's'} tracked
          </p>
          {watchlist.map(entry => (
            <ListItem
              key={entry.watchlist_id}
              onClick={() => navigate({ to: '/watchlist/$ticker', params: { ticker: entry.ticker } })}
              onRemove={() => removeTicker(entry.watchlist_id)}
              removeLabel={`remove ${entry.ticker}`}
            >
              <TickerPill symbol={entry.ticker} />
              {entry.ticker_name && <span className={styles.itemName}>{entry.ticker_name}</span>}
            </ListItem>
          ))}
        </div>
      )}

    </div>
  )
}
