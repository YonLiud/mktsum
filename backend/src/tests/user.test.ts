import 'dotenv/config'
import { describe, it, expect, afterEach, afterAll } from 'vitest'
import { prisma } from '../lib/prisma.ts'
import { userService } from '../services/userService.ts'
import express from 'express'
import request from 'supertest'
import userRouter from '../routes/internal/users.ts'

const app = express()
app.use(express.json())
app.use(userRouter)
app.use((err: any, _req: any, res: any, _next: any) => {
  res.status(500).json({ error: err.message })
})

const createdIds: string[] = []

afterEach(async () => {
  // Clean only IDs created by this test
  if (createdIds.length > 0) {
    await prisma.watchlist.deleteMany({ where: { user_id: { in: createdIds } } })
    await prisma.briefing.deleteMany({ where: { user_id: { in: createdIds } } })
    await prisma.user.deleteMany({ where: { user_id: { in: createdIds } } })
    createdIds.length = 0
  }
})

afterAll(async () => {
  await prisma.$disconnect()
})

describe('userService', () => {
  it('create — generates id and returns user', async () => {
    const result = await userService.create({ name: 'Test_User', ntfy_topic: 'test' })
    createdIds.push(result.user_id)
    expect(result.user_id).toBeTruthy()
    expect(result.user_id.length).toBe(12)
    expect(result.name).toBe('Test_User')
    expect(result.ntfy_topic).toBe('test')
  })

  it('getById — returns correct user with briefings and tickers', async () => {
    const created = await userService.create({ name: 'Test_GetById', ntfy_topic: 'topic' })
    createdIds.push(created.user_id)
    const found = await userService.getById(created.user_id)
    expect(found?.user_id).toBe(created.user_id)
    expect(found?.name).toBe('Test_GetById')
    expect(Array.isArray(found?.briefing)).toBe(true)
    expect(Array.isArray(found?.watchlist)).toBe(true)
  })

  it('getAll — includes created users', async () => {
    const u1 = await userService.create({ name: 'Test_All1', ntfy_topic: 'topic1' })
    const u2 = await userService.create({ name: 'Test_All2', ntfy_topic: 'topic2' })
    createdIds.push(u1.user_id, u2.user_id)
    const all = await userService.getAll()
    expect(all.length).toBeGreaterThanOrEqual(2)
    expect(all.some((u) => u.name === 'Test_All1')).toBe(true)
  })

  it('update — modifies user', async () => {
    const created = await userService.create({ name: 'Test_Update', ntfy_topic: 'old' })
    createdIds.push(created.user_id)
    const updated = await userService.update(created.user_id, { ntfy_topic: 'new' })
    expect(updated.ntfy_topic).toBe('new')
    expect(updated.name).toBe('Test_Update')
  })

  it('delete — removes user', async () => {
    const created = await userService.create({ name: 'Test_Delete', ntfy_topic: 'delete' })
    createdIds.push(created.user_id)
    await userService.delete(created.user_id)
    const found = await userService.getById(created.user_id)
    expect(found).toBeNull()
  })

  it('getTickers — returns user tickers only', async () => {
    const created = await userService.create({ name: 'Test_GetTickers', ntfy_topic: 'tickers' })
    createdIds.push(created.user_id)
    const { watchlistService } = await import('../services/watchlistService.ts')
    await watchlistService.addTicker(created.user_id, 'AAPL')
    await watchlistService.addTicker(created.user_id, 'GOOGL')
    const tickers = await userService.getTickers(created.user_id)
    expect(Array.isArray(tickers)).toBe(true)
    expect(tickers.length).toBe(2)
    expect(tickers.map((t: any) => t.ticker)).toContain('AAPL')
    expect(tickers.map((t: any) => t.ticker)).toContain('GOOGL')
  })
})

describe('userController (HTTP)', () => {
  it('POST / — creates user with 201', async () => {
    const res = await request(app)
      .post('/')
      .send({ name: 'Test_HTTP_Create', ntfy_topic: 'http' })
    expect(res.status).toBe(201)
    expect(res.body.user_id).toBeTruthy()
    createdIds.push(res.body.user_id)
    expect(res.body.name).toBe('Test_HTTP_Create')
  })

  it('GET / — returns users array', async () => {
    const u = await userService.create({ name: 'Test_HTTP_All', ntfy_topic: 'all' })
    createdIds.push(u.user_id)
    const res = await request(app).get('/')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('GET /:userId — returns correct user', async () => {
    const created = await userService.create({ name: 'Test_HTTP_GetById', ntfy_topic: 'get' })
    createdIds.push(created.user_id)
    const res = await request(app).get(`/${created.user_id}`)
    expect(res.status).toBe(200)
    expect(res.body.user_id).toBe(created.user_id)
    expect(res.body.name).toBe('Test_HTTP_GetById')
  })

  it('PATCH /:userId — updates user', async () => {
    const created = await userService.create({ name: 'Test_HTTP_Patch', ntfy_topic: 'old' })
    createdIds.push(created.user_id)
    const res = await request(app).patch(`/${created.user_id}`).send({ ntfy_topic: 'new' })
    expect(res.status).toBe(200)
    expect(res.body.ntfy_topic).toBe('new')
  })

  it('DELETE /:userId — removes user', async () => {
    const created = await userService.create({ name: 'Test_HTTP_Delete', ntfy_topic: 'del' })
    createdIds.push(created.user_id)
    const res = await request(app).delete(`/${created.user_id}`)
    expect(res.status).toBe(200)
    const found = await userService.getById(created.user_id)
    expect(found).toBeNull()
  })

  it('GET /:userId/tickers — returns user tickers', async () => {
    const created = await userService.create({ name: 'Test_HTTP_Tickers', ntfy_topic: 'tickers' })
    createdIds.push(created.user_id)
    const { watchlistService } = await import('../services/watchlistService.ts')
    await watchlistService.addTicker(created.user_id, 'MSFT')
    const res = await request(app).get(`/${created.user_id}/tickers`)
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.some((t: any) => t.ticker === 'MSFT')).toBe(true)
  })
})
