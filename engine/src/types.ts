export type NewsItem = {
  ticker: string
  title: string
  url: string
}

export type TickerWithNews = {
  symbol: string
  price: number | null
  change_pct: number | null
  news: NewsItem[]
}

export type User = {
  user_id: string
  username: string
  name: string
  role: string
  ntfy_topic: string | null
  created_at: string
  watchlist: { ticker: string }[]
}
