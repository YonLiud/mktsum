import { useEffect, useState } from 'react'
import { api } from '../api'
import type { Session, User } from '../types'

interface Props {
  session: Session
}

export default function Admin({ session }: Props) {
  const [users, setUsers] = useState<User[]>([])
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)

  async function load() {
    const res = await api.get('/v1/users')
    if (res.ok) setUsers(await res.json())
  }

  useEffect(() => { load() }, [])

  async function deleteUser(user: User) {
    if (!confirm(`Delete user "${user.username}"? This cannot be undone.`)) return
    const res = await api.delete(`/v1/users/${user.user_id}`)
    if (res.ok) { setMsg({ text: `Deleted ${user.username}`, ok: true }); load() }
    else setMsg({ text: 'Failed to delete', ok: false })
    setTimeout(() => setMsg(null), 3000)
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">All users</h2>
        <button onClick={load} className="text-xs text-indigo-600 hover:underline">Refresh</button>
      </div>

      {msg && <p className={`text-sm ${msg.ok ? 'text-green-600' : 'text-red-500'}`}>{msg.text}</p>}

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-2.5 text-left text-gray-500 font-medium">Username</th>
              <th className="px-4 py-2.5 text-left text-gray-500 font-medium">Name</th>
              <th className="px-4 py-2.5 text-left text-gray-500 font-medium">Role</th>
              <th className="px-4 py-2.5 text-left text-gray-500 font-medium">user_id</th>
              <th className="px-4 py-2.5 text-left text-gray-500 font-medium">Joined</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.user_id} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-2.5 font-medium text-gray-900">{u.username}</td>
                <td className="px-4 py-2.5 text-gray-700">{u.name}</td>
                <td className="px-4 py-2.5">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-2.5 font-mono text-xs text-gray-400">{u.user_id}</td>
                <td className="px-4 py-2.5 text-gray-500">{new Date(u.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-2.5 text-right">
                  {u.user_id !== session.user_id && (
                    <button
                      onClick={() => deleteUser(u)}
                      className="text-red-500 hover:text-red-700 text-xs font-medium"
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
