import { describe, test, expect, beforeEach } from 'bun:test'
import app from '../app'
import { cleanDb, insertTicker, insertUser, createSession, authHeader } from './helpers'

beforeEach(async () => {
  await cleanDb()
})

// ---------------------------------------------------------------------------
// GET /internal/tickers
// ---------------------------------------------------------------------------
describe('GET /internal/tickers', () => {
  test('returns an empty array when no tickers exist', async () => {
    const res = await app.request('/internal/tickers')
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual([])
  })

  test('returns all tickers', async () => {
    await insertTicker('AAPL', 'Apple Inc.')
    await insertTicker('TSLA', 'Tesla Inc.')

    const res = await app.request('/internal/tickers')
    expect(res.status).toBe(200)

    const data = (await res.json()) as any[]
    expect(data).toHaveLength(2)
    expect(data.map((t: any) => t.symbol).sort()).toEqual(['AAPL', 'TSLA'])
  })

  test('returned ticker has symbol, name, and description fields', async () => {
    await insertTicker('GOOG', 'Alphabet Inc.')

    const res = await app.request('/internal/tickers')
    const [ticker] = (await res.json()) as any[]
    expect(ticker).toHaveProperty('symbol')
    expect(ticker).toHaveProperty('name')
    expect(ticker).toHaveProperty('description')
  })
})

// ---------------------------------------------------------------------------
// GET /v1/tickers/:symbol
// ---------------------------------------------------------------------------
describe('GET /v1/tickers/:symbol', () => {
  test('returns the ticker when it exists', async () => {
    await insertTicker('MSFT', 'Microsoft Corporation')

    const res = await app.request('/v1/tickers/MSFT')
    expect(res.status).toBe(200)

    const ticker = (await res.json()) as any
    expect(ticker.symbol).toBe('MSFT')
    expect(ticker.name).toBe('Microsoft Corporation')
  })

  test('is case-insensitive (lowercase symbol resolves to uppercase row)', async () => {
    await insertTicker('NVDA', 'NVIDIA Corporation')

    const res = await app.request('/v1/tickers/nvda')
    expect(res.status).toBe(200)
    expect((await res.json() as any).symbol).toBe('NVDA')
  })

  test('returns 404 for an unknown symbol', async () => {
    const res = await app.request('/v1/tickers/ZZZZZ')
    expect(res.status).toBe(404)
    expect((await res.json() as any).error).toBeDefined()
  })
})

// ---------------------------------------------------------------------------
// POST /v1/tickers/:symbol/refresh — real Yahoo Finance calls
// ---------------------------------------------------------------------------
describe('POST /internal/tickers/:symbol/refresh', () => {
  test('refreshes an existing ticker and returns updated data for NVDA', async () => {
    await insertTicker('NVDA', 'Old Name')

    const res = await app.request('/internal/tickers/NVDA/refresh', { method: 'POST' })
    expect(res.status).toBe(200)

    const ticker = (await res.json()) as any
    expect(ticker.symbol).toBe('NVDA')
    expect(ticker.name).toBeTruthy()
    expect(ticker.name).not.toBe('Old Name')
  }, 15000)

  test('returns 404 for a fake ticker', async () => {
    await insertTicker('FAKETICKER', 'Fake')

    const res = await app.request('/internal/tickers/FAKETICKER/refresh', { method: 'POST' })
    expect(res.status).toBe(404)
  }, 15000)
})

// ---------------------------------------------------------------------------
// POST /v1/tickers/refresh-all
// ---------------------------------------------------------------------------
describe('POST /internal/tickers/refresh-all', () => {
  test('returns an empty array when no tickers exist', async () => {
    const res = await app.request('/internal/tickers/refresh-all', { method: 'POST' })
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// POST /v1/watchlist — real ticker vs fake ticker
// ---------------------------------------------------------------------------
describe('POST /v1/watchlist/user/:userId (ticker validation via Yahoo Finance)', () => {
  test('adds PLTR (real ticker) and returns 201', async () => {
    const user = await insertUser()
    const token = await createSession(user.user_id)

    const res = await app.request(`/v1/watchlist/user/${user.user_id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader(token) },
      body: JSON.stringify({ ticker: 'PLTR' }),
    })

    expect(res.status).toBe(201)
    const entry = (await res.json()) as any
    expect(entry.ticker).toBe('PLTR')
  }, 15000)

  test('rejects a fake ticker and returns 404', async () => {
    const user = await insertUser()
    const token = await createSession(user.user_id)

    const res = await app.request(`/v1/watchlist/user/${user.user_id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader(token) },
      body: JSON.stringify({ ticker: 'XYZFAKETICKER' }),
    })

    expect(res.status).toBe(404)
  }, 15000)
})
