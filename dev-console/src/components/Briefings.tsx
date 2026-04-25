import { useEffect, useState } from 'react'
import { api } from '../api'
import type { Briefing, Session } from '../types'

interface Props {
  session: Session
}

export default function Briefings({ session }: Props) {
  const [briefings, setBriefings] = useState<Briefing[]>([])
  const [selected, setSelected] = useState<Briefing | null>(null)
  const [fullSummary, setFullSummary] = useState('')
  const [shortSummary, setShortSummary] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)
  const [creating, setCreating] = useState(false)

  async function load() {
    const res = await api.get(`/v1/briefings/user/${session.user_id}`)
    if (res.ok) setBriefings(await res.json())
  }

  useEffect(() => { load() }, [session.user_id])

  function flash(text: string, ok: boolean) {
    setMsg({ text, ok })
    setTimeout(() => setMsg(null), 3000)
  }

  async function create() {
    if (!fullSummary.trim() || !shortSummary.trim()) {
      flash('Both summaries are required', false)
      return
    }
    setCreating(true)
    try {
      const res = await api.post('/v1/briefings', {
        user_id: session.user_id,
        full_summary: fullSummary,
        short_summary: shortSummary,
        is_public: isPublic,
      })
      if (res.ok) {
        setFullSummary(''); setShortSummary(''); setIsPublic(false)
        flash('Briefing created', true)
        load()
      } else {
        const d = await res.json()
        flash(d.error ?? 'Failed', false)
      }
    } finally {
      setCreating(false)
    }
  }

  async function deleteBriefing(id: string) {
    if (!confirm('Delete this briefing?')) return
    const res = await api.delete(`/v1/briefings/${id}`)
    if (res.ok) { if (selected?.briefing_id === id) setSelected(null); load() }
    else flash('Failed to delete', false)
  }

  async function view(id: string) {
    const res = await api.get(`/v1/briefings/${id}`)
    if (res.ok) setSelected(await res.json())
  }

  return (
    <div className="space-y-6">
      {/* Create */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3 max-w-2xl">
        <h2 className="text-sm font-semibold text-gray-700">Create briefing</h2>
        <textarea
          rows={2}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          placeholder="Short summary"
          value={shortSummary}
          onChange={e => setShortSummary(e.target.value)}
        />
        <textarea
          rows={5}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
          placeholder="Full summary"
          value={fullSummary}
          onChange={e => setFullSummary(e.target.value)}
        />
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={e => setIsPublic(e.target.checked)}
              className="rounded"
            />
            Public (share link)
          </label>
          <button
            onClick={create}
            disabled={creating}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            {creating ? 'Creating…' : 'Create'}
          </button>
          {msg && <span className={`text-sm ${msg.ok ? 'text-green-600' : 'text-red-500'}`}>{msg.text}</span>}
        </div>
      </div>

      {/* List + detail */}
      <div className="flex gap-5 items-start">
        <div className="flex-1 min-w-0 max-w-xl">
          {briefings.length === 0 ? (
            <p className="text-gray-400 text-sm">No briefings yet.</p>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-2.5 text-left text-gray-500 font-medium">Date</th>
                    <th className="px-4 py-2.5 text-left text-gray-500 font-medium">Short summary</th>
                    <th className="px-4 py-2.5 text-gray-500 font-medium">Public</th>
                    <th className="px-4 py-2.5" />
                  </tr>
                </thead>
                <tbody>
                  {briefings.map(b => (
                    <tr
                      key={b.briefing_id}
                      className={`border-b border-gray-100 last:border-0 cursor-pointer hover:bg-gray-50 ${selected?.briefing_id === b.briefing_id ? 'bg-indigo-50' : ''}`}
                      onClick={() => view(b.briefing_id)}
                    >
                      <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap">{new Date(b.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-2.5 text-gray-900 truncate max-w-xs">{b.short_summary}</td>
                      <td className="px-4 py-2.5 text-center">{b.is_public ? '✓' : ''}</td>
                      <td className="px-4 py-2.5 text-right">
                        <button
                          onClick={e => { e.stopPropagation(); deleteBriefing(b.briefing_id) }}
                          className="text-red-500 hover:text-red-700 text-xs font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {selected && (
          <div className="w-96 bg-white border border-gray-200 rounded-xl p-5 space-y-3 text-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-gray-900">{new Date(selected.created_at).toLocaleString()}</p>
                <p className="text-gray-400 text-xs font-mono mt-0.5">{selected.briefing_id}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-xs">✕</button>
            </div>
            {selected.is_public && (
              <span className="inline-block bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full">Public</span>
            )}
            <div>
              <p className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-1">Short</p>
              <p className="text-gray-800">{selected.short_summary}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-1">Full</p>
              <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{selected.full_summary}</p>
            </div>
            {selected.sources && selected.sources.length > 0 && (
              <div>
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-1">Sources</p>
                <ul className="space-y-1">
                  {selected.sources.map((s, i) => (
                    <li key={i} className="text-xs text-gray-700">
                      <span className="font-mono font-semibold">{s.ticker}</span> — <a href={s.url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">{s.title}</a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
