export interface Session {
  token: string
  user_id: string
  username: string
  name: string
  role: 'user' | 'admin'
}

export interface User {
  user_id: string
  username: string
  name: string
  role: 'user' | 'admin'
  ntfy_topic: string | null
  created_at: string
}

export interface Briefing {
  briefing_id: string
  user_id: string
  full_summary: string
  short_summary: string
  is_public: boolean
  notif_sent: boolean
  created_at: string
  sources?: { ticker: string; title: string; url: string }[]
}

export interface WatchlistEntry {
  watchlist_id: string
  user_id: string
  ticker: string
  ticker_name: string | null
  created_at: string
}
