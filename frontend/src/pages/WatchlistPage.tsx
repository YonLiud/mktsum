import { useState } from 'react'
import { useWatchlist, useAddTicker, useRemoveTicker } from '@/hooks/useWatchlist'

export function WatchlistPage() {
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
    <div className="max-w-2xl mx-auto px-4 py-12 flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-medium">watchlist.</h1>
        <p className="text-sm opacity-50 mt-1">your tracked tickers</p>
      </div>

      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="add ticker (e.g. AAPL)"
          className="flex-1 border border-current/20 rounded-lg px-3 py-2 text-sm bg-transparent focus:outline-none focus:border-current/40"
        />
        <button
          type="submit"
          disabled={isAdding || !input.trim()}
          className="px-4 py-2 text-sm border border-current/20 rounded-lg hover:bg-current/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isAdding ? 'adding...' : 'add'}
        </button>
      </form>

      {addError && (
        <p className="text-sm text-red-500 -mt-4">
          {(addError as Error).message.includes('Failed') ? 'ticker not found or already on watchlist.' : (addError as Error).message}
        </p>
      )}

      {isLoading ? (
        <p className="text-sm opacity-40">loading...</p>
      ) : !watchlist?.length ? (
        <p className="text-sm opacity-40">no tickers yet. add one above.</p>
      ) : (
        <div className="flex flex-col gap-2">
          <p className="text-xs opacity-40 uppercase tracking-widest">tickers</p>
          <div className="flex flex-col gap-1">
            {watchlist.map(entry => (
              <div
                key={entry.watchlist_id}
                className="flex items-center justify-between border border-current/10 rounded-lg px-4 py-3"
              >
                <span className="font-medium">{entry.ticker}</span>
                <button
                  onClick={() => removeTicker(entry.watchlist_id)}
                  className="text-xs opacity-40 hover:opacity-80 transition-opacity cursor-pointer"
                >
                  remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
