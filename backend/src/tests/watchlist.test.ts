import { describe, test, expect, beforeEach } from 'bun:test'
import app from '../app'
import { cleanDb, insertUser, insertWatchlistEntry } from './helpers'

beforeEach(async () => {
  await cleanDb()
})

// ---------------------------------------------------------------------------
// POST /v1/watchlist/user/:userId
// ---------------------------------------------------------------------------
describe('POST /v1/watchlist/user/:userId', () => {
  test('adds a ticker and returns 201 with the entry', async () => {
    const user = await insertUser()

    const res = await app.request(`/v1/watchlist/user/${user.user_id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticker: 'aapl' }),
    })

    expect(res.status).toBe(201)
    const entry = (await res.json()) as any
    expect(entry.watchlist_id).toBeDefined()
    expect(entry.user_id).toBe(user.user_id)
    expect(entry.ticker).toBe('AAPL') // service uppercases tickers
  })
})

// ---------------------------------------------------------------------------
// GET /v1/watchlist/user/:userId
// ---------------------------------------------------------------------------
describe('GET /v1/watchlist/user/:userId', () => {
  test('returns an empty array when user has no watchlist entries', async () => {
    const user = await insertUser()

    const res = await app.request(`/v1/watchlist/user/${user.user_id}`)
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual([])
  })

  test('returns all watchlist entries for the user', async () => {
    const user = await insertUser()
    await insertWatchlistEntry(user.user_id, 'AAPL')
    await insertWatchlistEntry(user.user_id, 'TSLA')

    const res = await app.request(`/v1/watchlist/user/${user.user_id}`)
    expect(res.status).toBe(200)

    const data = (await res.json()) as any[]
    expect(data).toHaveLength(2)
    expect(data.map((e: any) => e.ticker).sort()).toEqual(['AAPL', 'TSLA'])
  })

  test('does not return entries belonging to another user', async () => {
    const user1 = await insertUser({ name: 'User1' })
    const user2 = await insertUser({ name: 'User2' })
    await insertWatchlistEntry(user2.user_id, 'GOOG')

    const res = await app.request(`/v1/watchlist/user/${user1.user_id}`)
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// DELETE /v1/watchlist/:id
// ---------------------------------------------------------------------------
describe('DELETE /v1/watchlist/:id', () => {
  test('removes an entry by ID and returns { success: true }', async () => {
    const user = await insertUser()
    const entry = await insertWatchlistEntry(user.user_id, 'MSFT')

    const res = await app.request(`/v1/watchlist/${entry.watchlist_id}`, {
      method: 'DELETE',
    })

    expect(res.status).toBe(200)
    expect((await res.json() as any).success).toBe(true)
  })

  test('entry is gone after deletion', async () => {
    const user = await insertUser()
    const entry = await insertWatchlistEntry(user.user_id, 'MSFT')
    await app.request(`/v1/watchlist/${entry.watchlist_id}`, { method: 'DELETE' })

    const res = await app.request(`/v1/watchlist/user/${user.user_id}`)
    expect(await res.json()).toEqual([])
  })

  test('returns 404 for a nonexistent entry', async () => {
    const res = await app.request('/v1/watchlist/doesnotexist', { method: 'DELETE' })
    expect(res.status).toBe(404)
    expect((await res.json() as any).error).toBe('Entry not found')
  })
})

// ---------------------------------------------------------------------------
// DELETE /v1/watchlist/user/:userId/ticker
// ---------------------------------------------------------------------------
describe('DELETE /v1/watchlist/user/:userId/ticker', () => {
  test('removes an entry by ticker and returns { success: true }', async () => {
    const user = await insertUser()
    await insertWatchlistEntry(user.user_id, 'NVDA')

    const res = await app.request(`/v1/watchlist/user/${user.user_id}/ticker`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticker: 'NVDA' }),
    })

    expect(res.status).toBe(200)
    expect((await res.json() as any).success).toBe(true)
  })

  test('ticker is case-insensitive (lowercase input removes uppercase entry)', async () => {
    const user = await insertUser()
    await insertWatchlistEntry(user.user_id, 'AMD')

    const res = await app.request(`/v1/watchlist/user/${user.user_id}/ticker`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticker: 'amd' }),
    })

    expect(res.status).toBe(200)
    expect((await res.json() as any).success).toBe(true)
  })

  test('returns 404 when the ticker does not exist', async () => {
    const user = await insertUser()

    const res = await app.request(`/v1/watchlist/user/${user.user_id}/ticker`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticker: 'ZZZZZ' }),
    })

    expect(res.status).toBe(404)
    expect((await res.json() as any).error).toBe('Entry not found')
  })
})

// ---------------------------------------------------------------------------
// GET /internal/watchlist/tickers
// ---------------------------------------------------------------------------
describe('GET /internal/watchlist/tickers', () => {
  test('returns an empty array when watchlist is empty', async () => {
    const res = await app.request('/internal/watchlist/tickers')
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual([])
  })

  test('returns only unique tickers across all users', async () => {
    const user1 = await insertUser({ name: 'User1' })
    const user2 = await insertUser({ name: 'User2' })
    // Both users watch AAPL; only one unique entry should appear
    await insertWatchlistEntry(user1.user_id, 'AAPL')
    await insertWatchlistEntry(user2.user_id, 'AAPL')
    await insertWatchlistEntry(user1.user_id, 'GOOG')

    const res = await app.request('/internal/watchlist/tickers')
    expect(res.status).toBe(200)

    const tickers = (await res.json()) as string[]
    expect(tickers.sort()).toEqual(['AAPL', 'GOOG'])
  })
})
