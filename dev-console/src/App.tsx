import { useState } from 'react'
import { api } from './api'
import type { Session } from './types'
import Login from './components/Login'
import Profile from './components/Profile'
import Watchlist from './components/Watchlist'
import Briefings from './components/Briefings'
import Admin from './components/Admin'

type Tab = 'profile' | 'watchlist' | 'briefings' | 'admin'

function loadSession(): Session | null {
  try { return JSON.parse(localStorage.getItem('session') ?? 'null') } catch { return null }
}

export default function App() {
  const [session, setSession] = useState<Session | null>(loadSession)
  const [tab, setTab] = useState<Tab>('profile')

  async function logout() {
    try { await api.post('/v1/auth/logout') } finally { clearSession() }
  }

  async function logoutAll() {
    try { await api.post('/v1/auth/logout-all') } finally { clearSession() }
  }

  function clearSession() {
    localStorage.removeItem('token')
    localStorage.removeItem('session')
    setSession(null)
  }

  if (!session) return <Login onLogin={setSession} />

  const tabs: { id: Tab; label: string }[] = [
    { id: 'profile', label: 'Profile' },
    { id: 'watchlist', label: 'Watchlist' },
    { id: 'briefings', label: 'Briefings' },
    ...(session.role === 'admin' ? [{ id: 'admin' as Tab, label: 'Admin' }] : []),
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-gray-900">mktsum</span>
          <span className="text-gray-300">·</span>
          <span className="text-sm text-gray-500">dev console</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">
            {session.username}
            {session.role === 'admin' && (
              <span className="ml-1.5 text-xs bg-purple-100 text-purple-700 font-medium px-1.5 py-0.5 rounded-full">admin</span>
            )}
          </span>
          <button
            onClick={logout}
            className="text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors"
          >
            Logout
          </button>
          <button
            onClick={logoutAll}
            className="text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors"
          >
            Logout all
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6">
        <nav className="flex gap-1">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === t.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <main className="px-6 py-6">
        {tab === 'profile' && <Profile session={session} />}
        {tab === 'watchlist' && <Watchlist session={session} />}
        {tab === 'briefings' && <Briefings session={session} />}
        {tab === 'admin' && session.role === 'admin' && <Admin session={session} />}
      </main>
    </div>
  )
}
