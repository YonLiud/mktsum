import { describe, test, expect, beforeEach } from 'bun:test'
import app from '../app'
import { cleanDb, insertUser, insertWatchlistEntry, createSession, authHeader } from './helpers'

beforeEach(async () => {
  await cleanDb()
})

// ---------------------------------------------------------------------------
// POST /v1/watchlist/user/:userId
// ---------------------------------------------------------------------------
describe('POST /v1/watchlist/user/:userId', () => {
  test('returns 401 without a token', async () => {
    const user = await insertUser()
    const res = await app.request(`/v1/watchlist/user/${user.user_id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticker: 'AAPL' }),
    })
    expect(res.status).toBe(401)
  })

  test('returns 403 when adding to another user\'s watchlist', async () => {
    const user1 = await insertUser()
    const user2 = await insertUser()
    const token = await createSession(user1.user_id)

    const res = await app.request(`/v1/watchlist/user/${user2.user_id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader(token) },
      body: JSON.stringify({ ticker: 'AAPL' }),
    })
    expect(res.status).toBe(403)
  })

  test('adds a ticker and returns 201', async () => {
    const user = await insertUser()
    const token = await createSession(user.user_id)

    const res = await app.request(`/v1/watchlist/user/${user.user_id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader(token) },
      body: JSON.stringify({ ticker: 'aapl' }),
    })

    expect(res.status).toBe(201)
    const entry = (await res.json()) as any
    expect(entry.watchlist_id).toBeDefined()
    expect(entry.ticker).toBe('AAPL')
  })
})

// ---------------------------------------------------------------------------
// GET /v1/watchlist/user/:userId
// ---------------------------------------------------------------------------
describe('GET /v1/watchlist/user/:userId', () => {
  test('returns 401 without a token', async () => {
    const user = await insertUser()
    const res = await app.request(`/v1/watchlist/user/${user.user_id}`)
    expect(res.status).toBe(401)
  })

  test('returns 403 when accessing another user\'s watchlist', async () => {
    const user1 = await insertUser()
    const user2 = await insertUser()
    const token = await createSession(user1.user_id)

    const res = await app.request(`/v1/watchlist/user/${user2.user_id}`, {
      headers: authHeader(token),
    })
    expect(res.status).toBe(403)
  })

  test('returns all watchlist entries for self', async () => {
    const user = await insertUser()
    const token = await createSession(user.user_id)
    await insertWatchlistEntry(user.user_id, 'AAPL')
    await insertWatchlistEntry(user.user_id, 'TSLA')

    const res = await app.request(`/v1/watchlist/user/${user.user_id}`, {
      headers: authHeader(token),
    })
    expect(res.status).toBe(200)
    const data = (await res.json()) as any[]
    expect(data).toHaveLength(2)
    expect(data.map((e: any) => e.ticker).sort()).toEqual(['AAPL', 'TSLA'])
  })

  test('returns an empty array when user has no entries', async () => {
    const user = await insertUser()
    const token = await createSession(user.user_id)

    const res = await app.request(`/v1/watchlist/user/${user.user_id}`, {
      headers: authHeader(token),
    })
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// DELETE /v1/watchlist/:id
// ---------------------------------------------------------------------------
describe('DELETE /v1/watchlist/:id', () => {
  test('returns 401 without a token', async () => {
    const user = await insertUser()
    const entry = await insertWatchlistEntry(user.user_id, 'MSFT')

    const res = await app.request(`/v1/watchlist/${entry.watchlist_id}`, { method: 'DELETE' })
    expect(res.status).toBe(401)
  })

  test('removes an entry by ID and returns { success: true }', async () => {
    const user = await insertUser()
    const token = await createSession(user.user_id)
    const entry = await insertWatchlistEntry(user.user_id, 'MSFT')

    const res = await app.request(`/v1/watchlist/${entry.watchlist_id}`, {
      method: 'DELETE',
      headers: authHeader(token),
    })
    expect(res.status).toBe(200)
    expect((await res.json() as any).success).toBe(true)
  })

  test('returns 404 for a nonexistent entry', async () => {
    const user = await insertUser()
    const token = await createSession(user.user_id)

    const res = await app.request('/v1/watchlist/doesnotexist', {
      method: 'DELETE',
      headers: authHeader(token),
    })
    expect(res.status).toBe(404)
  })
})

// ---------------------------------------------------------------------------
// DELETE /v1/watchlist/user/:userId/ticker
// ---------------------------------------------------------------------------
describe('DELETE /v1/watchlist/user/:userId/ticker', () => {
  test('returns 401 without a token', async () => {
    const user = await insertUser()
    await insertWatchlistEntry(user.user_id, 'NVDA')

    const res = await app.request(`/v1/watchlist/user/${user.user_id}/ticker`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticker: 'NVDA' }),
    })
    expect(res.status).toBe(401)
  })

  test('returns 403 when removing from another user\'s watchlist', async () => {
    const user1 = await insertUser()
    const user2 = await insertUser()
    const token = await createSession(user1.user_id)
    await insertWatchlistEntry(user2.user_id, 'NVDA')

    const res = await app.request(`/v1/watchlist/user/${user2.user_id}/ticker`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', ...authHeader(token) },
      body: JSON.stringify({ ticker: 'NVDA' }),
    })
    expect(res.status).toBe(403)
  })

  test('removes an entry by ticker', async () => {
    const user = await insertUser()
    const token = await createSession(user.user_id)
    await insertWatchlistEntry(user.user_id, 'NVDA')

    const res = await app.request(`/v1/watchlist/user/${user.user_id}/ticker`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', ...authHeader(token) },
      body: JSON.stringify({ ticker: 'NVDA' }),
    })
    expect(res.status).toBe(200)
    expect((await res.json() as any).success).toBe(true)
  })

  test('ticker removal is case-insensitive', async () => {
    const user = await insertUser()
    const token = await createSession(user.user_id)
    await insertWatchlistEntry(user.user_id, 'AMD')

    const res = await app.request(`/v1/watchlist/user/${user.user_id}/ticker`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', ...authHeader(token) },
      body: JSON.stringify({ ticker: 'amd' }),
    })
    expect(res.status).toBe(200)
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
    await insertWatchlistEntry(user1.user_id, 'AAPL')
    await insertWatchlistEntry(user2.user_id, 'AAPL')
    await insertWatchlistEntry(user1.user_id, 'GOOG')

    const res = await app.request('/internal/watchlist/tickers')
    expect(res.status).toBe(200)
    expect((await res.json() as string[]).sort()).toEqual(['AAPL', 'GOOG'])
  })
})
