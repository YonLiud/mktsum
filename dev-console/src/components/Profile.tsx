import { useEffect, useState } from 'react'
import { api } from '../api'
import type { Session, User } from '../types'

interface Props {
  session: Session
}

export default function Profile({ session }: Props) {
  const [user, setUser] = useState<User | null>(null)
  const [name, setName] = useState('')
  const [ntfy, setNtfy] = useState('')
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)

  useEffect(() => {
    api.get(`/v1/users/${session.user_id}`)
      .then(r => r.json())
      .then((u: User) => { setUser(u); setName(u.name); setNtfy(u.ntfy_topic ?? '') })
  }, [session.user_id])

  async function save() {
    const body: Record<string, string> = { name }
    if (ntfy) body.ntfy_topic = ntfy
    const res = await api.patch(`/v1/users/${session.user_id}`, body)
    if (res.ok) {
      setMsg({ text: 'Saved', ok: true })
      const updated: User = await res.json()
      setUser(updated)
    } else {
      setMsg({ text: 'Failed to save', ok: false })
    }
    setTimeout(() => setMsg(null), 3000)
  }

  if (!user) return <p className="text-gray-500 text-sm">Loading…</p>

  return (
    <div className="space-y-6 max-w-lg">
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <tbody>
            {[
              ['user_id', user.user_id],
              ['username', user.username],
              ['name', user.name],
              ['role', user.role],
              ['ntfy_topic', user.ntfy_topic ?? '—'],
              ['created_at', new Date(user.created_at).toLocaleString()],
            ].map(([k, v]) => (
              <tr key={k} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-2.5 text-gray-500 font-medium w-32">{k}</td>
                <td className="px-4 py-2.5 text-gray-900 font-mono text-xs">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">Edit profile</h2>
        <input
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Display name"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <input
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="ntfy topic"
          value={ntfy}
          onChange={e => setNtfy(e.target.value)}
        />
        <div className="flex items-center gap-3">
          <button
            onClick={save}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Save
          </button>
          {msg && <span className={`text-sm ${msg.ok ? 'text-green-600' : 'text-red-500'}`}>{msg.text}</span>}
        </div>
      </div>
    </div>
  )
}
