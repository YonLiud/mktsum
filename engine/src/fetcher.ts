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

export async function getTickers(): Promise<string[]> {
  return get<string[]>('/internal/watchlist/tickers')
}

export type TickerRecord = {
  symbol: string
  name: string
  price: number | null
  change_pct: number | null
}

export async function getAllTickerRecords(): Promise<TickerRecord[]> {
  return get<TickerRecord[]>('/internal/tickers')
}

export async function refreshAllTickers(): Promise<void> {
  await post('/internal/tickers/refresh-all')
}

export type BriefingPayload = {
  user_id: string
  subject?: string
  full_summary: string
  short_summary: string
  sources?: { ticker: string; title: string; url: string }[]
}

export async function postBriefingsBulk(briefings: BriefingPayload[]): Promise<void> {
  await post('/internal/briefings/bulk', briefings)
}
