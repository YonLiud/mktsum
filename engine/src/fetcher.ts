import type { User } from './types'

const BASE_URL = process.env.BACKEND_URL ?? 'http://localhost:5000'

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`)
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`)
  return res.json() as Promise<T>
}

async function post<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`)
  return res.json() as Promise<T>
}

export async function getUsers(): Promise<User[]> {
  return get<User[]>('/internal/users')
}

export type TickerRecord = {
  symbol: string
  name: string
  price: number | null
  change_pct: number | null
}

export async function refreshWatchedTickers(symbols: string[]): Promise<TickerRecord[]> {
  const results = await Promise.all(
    symbols.map(symbol => post<TickerRecord | null>(`/internal/tickers/${symbol}/refresh`))
  )
  return results.filter((r): r is TickerRecord => r !== null)
}

export type BriefingPayload = {
  user_id: string
  subject?: string
  full_summary: string
  short_summary: string
  sources?: { ticker: string; title: string; url: string }[]
}

export async function postBriefing(briefing: BriefingPayload): Promise<{ briefing_id: string }> {
  return post('/internal/briefings', briefing)
}

export async function triggerNotifier(briefingId: string): Promise<void> {
  const url = process.env.NOTIFIER_URL ?? 'http://notifier:3001'
  const res = await fetch(`${url}/trigger`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ briefing_id: briefingId }),
  })
  if (!res.ok) throw new Error(`notifier trigger failed: ${res.status}`)
}
