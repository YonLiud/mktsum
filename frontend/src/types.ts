export interface Briefing {
  briefing_id: string
  user_id: string
  user_name: string
  full_summary: string
  short_summary: string
  is_public: boolean
  notif_sent: boolean
  created_at: string
  sources?: { ticker: string; title: string; url: string }[]
}

export interface Ticker {
  symbol: string
  name: string
  description?: string
}

export interface WatchlistEntry {
  watchlist_id: string
  user_id: string
  ticker: string
  ticker_name?: string
  created_at: string
}
