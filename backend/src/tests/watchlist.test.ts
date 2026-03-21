import 'dotenv/config'
import { describe, it, expect, afterEach, afterAll, beforeEach } from 'vitest'
import { prisma } from '../lib/prisma.ts'
import { watchlistService } from '../services/watchlistService.ts'
import { userService } from '../services/userService.ts'
import express from 'express'
import request from 'supertest'
import watchlistRouter from '../routes/internal/watchlists.ts'

const app = express()
app.use(express.json())
app.use(watchlistRouter)
app.use((err: any, _req: any, res: any, _next: any) => {
  res.status(500).json({ error: err.message })
})

let testUserId: string
const createdUserIds: string[] = []

beforeEach(async () => {
  const user = await userService.create({ name: 'Test_WL_User', ntfy_topic: 'test' })
  testUserId = user.user_id
  createdUserIds.push(user.user_id)
})

afterEach(async () => {
  // Clean only records we created
  if (createdUserIds.length > 0) {
    await prisma.watchlist.deleteMany({ where: { user_id: { in: createdUserIds } } })
    await prisma.briefing.deleteMany({ where: { user_id: { in: createdUserIds } } })
    await prisma.user.deleteMany({ where: { user_id: { in: createdUserIds } } })
    createdUserIds.length = 0
  }
})

afterAll(async () => {
  await prisma.$disconnect()
})

describe('watchlistService', () => {
  it('addTicker — creates watchlist entry', async () => {
    const result = await watchlistService.addTicker(testUserId, 'AAPL')
    expect(result.watchlist_id).toBeTruthy()
    expect(result.user_id).toBe(testUserId)
    expect(result.ticker).toBe('AAPL')
  })

  it('addTicker duplicate — returns error object', async () => {
    await watchlistService.addTicker(testUserId, 'AAPL')
    const result = await watchlistService.addTicker(testUserId, 'AAPL')
    expect('error' in result).toBe(true)
    expect(result.error).toContain('already has this ticker')
  })

  it('hasTicker — returns true when exists', async () => {
    await watchlistService.addTicker(testUserId, 'GOOGL')
    const exists = await watchlistService.hasTicker(testUserId, 'GOOGL')
    expect(exists).toBe(true)
  })

  it('hasTicker — returns false when missing', async () => {
    const exists = await watchlistService.hasTicker(testUserId, 'MISSING')
    expect(exists).toBe(false)
  })

  it('getByUser — returns user tickers', async () => {
    await watchlistService.addTicker(testUserId, 'AAPL')
    await watchlistService.addTicker(testUserId, 'MSFT')
    const tickers = await watchlistService.getByUser(testUserId)
    expect(tickers.length).toBe(2)
    expect(tickers.map((t) => t.ticker)).toContain('AAPL')
    expect(tickers.map((t) => t.ticker)).toContain('MSFT')
  })

  it('getAllUniqueTickers — returns distinct tickers only', async () => {
    const user2 = await userService.create({ name: 'Test_WL_User2', ntfy_topic: 'test2' })
    createdUserIds.push(user2.user_id)
    await watchlistService.addTicker(testUserId, 'AAPL')
    await watchlistService.addTicker(user2.user_id, 'AAPL')
    await watchlistService.addTicker(testUserId, 'GOOGL')
    const tickers = await watchlistService.getAllUniqueTickers()
    const tickerValues = tickers.map((t) => t.ticker)
    expect(tickerValues).toContain('AAPL')
    expect(tickerValues).toContain('GOOGL')
    expect(tickerValues.filter((t) => t === 'AAPL').length).toBe(1)
  })

  it('removeTicker — deletes entry', async () => {
    await watchlistService.addTicker(testUserId, 'AAPL')
    const result = await watchlistService.removeTicker(testUserId, 'AAPL')
    expect('error' in result).toBe(false)
    const exists = await watchlistService.hasTicker(testUserId, 'AAPL')
    expect(exists).toBe(false)
  })

  it('removeTicker not found — returns error object', async () => {
    const result = await watchlistService.removeTicker(testUserId, 'NOTEXIST')
    expect('error' in result).toBe(true)
    expect(result.error).toContain('not found')
  })
})

describe('watchlistController (HTTP)', () => {
  it('POST / — adds ticker', async () => {
    const res = await request(app)
      .post('/')
      .send({ user_id: testUserId, ticker: 'AAPL' })
    expect(res.status).toBe(200)
    expect(res.body.ticker).toBe('AAPL')
  })

  it('POST / duplicate — 400 with error', async () => {
    await watchlistService.addTicker(testUserId, 'AAPL')
    const res = await request(app)
      .post('/')
      .send({ user_id: testUserId, ticker: 'AAPL' })
    expect(res.status).toBe(400)
    expect(res.body.error).toBeTruthy()
  })

  it('POST /check — returns boolean', async () => {
    await watchlistService.addTicker(testUserId, 'AAPL')
    const res = await request(app).post('/check').send({ user_id: testUserId, ticker: 'AAPL' })
    expect(res.status).toBe(200)
    expect(res.body).toBe(true)
  })

  it('POST /list — returns user tickers', async () => {
    await watchlistService.addTicker(testUserId, 'AAPL')
    const res = await request(app).post('/list').send({ user_id: testUserId })
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBe(1)
    expect(res.body[0].ticker).toBe('AAPL')
  })

  it('GET /tickers — returns distinct tickers', async () => {
    const user2 = await userService.create({ name: 'Test_WL_User2', ntfy_topic: 'test2' })
    createdUserIds.push(user2.user_id)
    await watchlistService.addTicker(testUserId, 'AAPL')
    await watchlistService.addTicker(user2.user_id, 'AAPL')
    const res = await request(app).get('/tickers')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.some((t) => t.ticker === 'AAPL')).toBe(true)
  })

  it('DELETE / — removes ticker', async () => {
    await watchlistService.addTicker(testUserId, 'AAPL')
    const res = await request(app)
      .delete('/')
      .send({ user_id: testUserId, ticker: 'AAPL' })
    expect(res.status).toBe(200)
  })

  it('DELETE / not found — 400 with error', async () => {
    const res = await request(app)
      .delete('/')
      .send({ user_id: testUserId, ticker: 'NOTEXIST' })
    expect(res.status).toBe(400)
    expect(res.body.error).toBeTruthy()
  })

  it('POST /users — returns users by ticker', async () => {
    await watchlistService.addTicker(testUserId, 'AAPL')
    const res = await request(app).post('/users').send({ ticker: 'AAPL' })
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBe(1)
    expect(res.body[0].user_id).toBe(testUserId)
  })
})
