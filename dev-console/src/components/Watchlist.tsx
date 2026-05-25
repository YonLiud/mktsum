import { useEffect, useState } from 'react'
import { api } from '../api'
import type { Session, WatchlistEntry } from '../types'

interface Props {
  session: Session
}

export default function Watchlist({ session }: Props) {
  const [entries, setEntries] = useState<WatchlistEntry[]>([])
  const [ticker, setTicker] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)

  async function load() {
    const res = await api.get(`/v1/watchlist/user/${session.user_id}`)
    if (res.ok) setEntries(await res.json())
  }

  useEffect(() => { load() }, [session.user_id])

  function flash(text: string, ok: boolean) {
    setMsg({ text, ok })
    setTimeout(() => setMsg(null), 3000)
  }

  async function add() {
    if (!ticker.trim()) return
    setLoading(true)
    try {
      const res = await api.post(`/v1/watchlist/user/${session.user_id}`, { ticker: ticker.trim() })
      if (res.ok) { setTicker(''); load(); flash(`Added ${ticker.toUpperCase()}`, true) }
      else { const d = await res.json(); flash(d.error ?? 'Failed', false) }
    } finally {
      setLoading(false)
    }
  }

  async function remove(id: string, symbol: string) {
    const res = await api.delete(`/v1/watchlist/${id}`)
    if (res.ok) { load(); flash(`Removed ${symbol}`, true) }
    else flash('Failed to remove', false)
  }

  return (
    <div className="space-y-5 max-w-lg">
      <div className="flex gap-2">
        <input
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase placeholder:normal-case"
          placeholder="Ticker symbol (e.g. AAPL)"
          value={ticker}
          onChange={e => setTicker(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
        />
        <button
          onClick={add}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          {loading ? '…' : 'Add'}
        </button>
      </div>

      {msg && <p className={`text-sm ${msg.ok ? 'text-green-600' : 'text-red-500'}`}>{msg.text}</p>}

      {entries.length === 0 ? (
        <p className="text-gray-400 text-sm">No tickers yet.</p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-2.5 text-left text-gray-500 font-medium">Symbol</th>
                <th className="px-4 py-2.5 text-left text-gray-500 font-medium">Name</th>
                <th className="px-4 py-2.5 text-left text-gray-500 font-medium">Added</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {entries.map(e => (
                <tr key={e.watchlist_id} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-2.5 font-mono font-semibold text-gray-900">{e.ticker}</td>
                  <td className="px-4 py-2.5 text-gray-700">{e.ticker_name ?? '—'}</td>
                  <td className="px-4 py-2.5 text-gray-500">{new Date(e.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      onClick={() => remove(e.watchlist_id, e.ticker)}
                      className="text-red-500 hover:text-red-700 text-xs font-medium"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
