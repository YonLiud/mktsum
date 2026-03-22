import 'dotenv/config'
import { describe, it, expect, afterEach, afterAll, beforeEach } from 'vitest'
import { prisma } from '../lib/prisma.ts'
import { userService } from '../services/userService.ts'
import { briefingService } from '../services/briefingService.ts'
import { watchlistService } from '../services/watchlistService.ts'
import express from 'express'
import request from 'supertest'
import userRouter from '../routes/internal/users.ts'
import briefingRouter from '../routes/internal/briefings.ts'
import watchlistRouter from '../routes/internal/watchlists.ts'
import { errorHandler } from '../middleware/errorHandler.ts'

const createApp = (router: any) => {
  const app = express()
  app.use(express.json())
  app.use(router)
  app.use(errorHandler)
  return app
}

const userApp = createApp(userRouter)
const briefingApp = createApp(briefingRouter)
const watchlistApp = createApp(watchlistRouter)

let testUserId: string
const createdUserIds: string[] = []

beforeEach(async () => {
  const user = await userService.create({ name: 'Test_Error_User', ntfy_topic: 'test' })
  testUserId = user.user_id
  createdUserIds.push(user.user_id)
})

afterEach(async () => {
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

describe('Error Handling & Validation', () => {
  describe('User Service Validation', () => {
    it('validateCreate — throws on missing name', () => {
      expect(() => userService.validateCreate({ ntfy_topic: 'test' })).toThrow('Invalid or missing name')
    })

    it('validateCreate — throws on empty name', () => {
      expect(() => userService.validateCreate({ name: '  ', ntfy_topic: 'test' })).toThrow('Invalid or missing name')
    })

    it('validateCreate — throws on missing ntfy_topic', () => {
      expect(() => userService.validateCreate({ name: 'Test' })).toThrow('Invalid or missing ntfy_topic')
    })

    it('validateCreate — throws on empty ntfy_topic', () => {
      expect(() => userService.validateCreate({ name: 'Test', ntfy_topic: '  ' })).toThrow(
        'Invalid or missing ntfy_topic'
      )
    })

    it('validateCreate — trims whitespace', () => {
      const result = userService.validateCreate({ name: '  Test  ', ntfy_topic: '  topic  ' })
      expect(result.name).toBe('Test')
      expect(result.ntfy_topic).toBe('topic')
    })

    it('validateUpdate — throws on invalid name', () => {
      expect(() => userService.validateUpdate({ name: '' })).toThrow('Invalid name')
    })

    it('validateUpdate — throws on no valid fields', () => {
      expect(() => userService.validateUpdate({})).toThrow('No valid fields to update')
    })

    it('validateUpdate — returns only updated fields', () => {
      const result = userService.validateUpdate({ name: 'New Name' })
      expect(result.ntfy_topic).toBeUndefined()
      expect(result.name).toBe('New Name')
    })
  })

  describe('Briefing Service Validation', () => {
    it('validateCreate — throws on missing user_id', () => {
      expect(() =>
        briefingService.validateCreate({
          full_summary: 'Full',
          short_summary: 'Short',
        })
      ).toThrow('Invalid or missing user_id')
    })

    it('validateCreate — throws on missing full_summary', () => {
      expect(() =>
        briefingService.validateCreate({
          user_id: testUserId,
          short_summary: 'Short',
        })
      ).toThrow('Invalid or missing full_summary')
    })

    it('validateCreate — throws on missing short_summary', () => {
      expect(() =>
        briefingService.validateCreate({
          user_id: testUserId,
          full_summary: 'Full',
        })
      ).toThrow('Invalid or missing short_summary')
    })

    it('validateCreate — converts array sources to JSON string', () => {
      const result = briefingService.validateCreate({
        user_id: testUserId,
        full_summary: 'Full',
        short_summary: 'Short',
        sources: ['source1', 'source2'],
      })
      expect(typeof result.sources).toBe('string')
      expect(result.sources).toBe(JSON.stringify(['source1', 'source2']))
    })

    it('validateCreate — converts string notif_sent "true" to boolean', () => {
      const result = briefingService.validateCreate({
        user_id: testUserId,
        full_summary: 'Full',
        short_summary: 'Short',
        notif_sent: 'true',
      })
      expect(result.notif_sent).toBe(true)
      expect(typeof result.notif_sent).toBe('boolean')
    })

    it('validateCreate — converts string notif_sent "false" to boolean', () => {
      const result = briefingService.validateCreate({
        user_id: testUserId,
        full_summary: 'Full',
        short_summary: 'Short',
        notif_sent: 'false',
      })
      expect(result.notif_sent).toBe(false)
    })

    it('validateCreate — throws on invalid notif_sent string', () => {
      expect(() =>
        briefingService.validateCreate({
          user_id: testUserId,
          full_summary: 'Full',
          short_summary: 'Short',
          notif_sent: 'invalid',
        })
      ).toThrow('notif_sent must be a boolean or "true"/"false"')
    })

    it('validateCreate — throws on invalid sources format', () => {
      expect(() =>
        briefingService.validateCreate({
          user_id: testUserId,
          full_summary: 'Full',
          short_summary: 'Short',
          sources: 123,
        })
      ).toThrow('Invalid sources format')
    })

    it('validateUpdate — throws on no valid fields', () => {
      expect(() => briefingService.validateUpdate({})).toThrow('No valid fields to update')
    })
  })

  describe('Watchlist Service Validation', () => {
    it('validateAddTicker — throws on missing user_id', () => {
      expect(() => watchlistService.validateAddTicker('', 'AAPL')).toThrow('Invalid or missing user_id')
    })

    it('validateAddTicker — throws on missing ticker', () => {
      expect(() => watchlistService.validateAddTicker(testUserId, '')).toThrow('Invalid or missing ticker')
    })

    it('validateAddTicker — converts ticker to uppercase', () => {
      const result = watchlistService.validateAddTicker(testUserId, 'aapl')
      expect(result.ticker).toBe('AAPL')
    })

    it('validateAddTicker — trims whitespace', () => {
      const result = watchlistService.validateAddTicker('  ' + testUserId + '  ', '  aapl  ')
      expect(result.user_id).toBe(testUserId)
      expect(result.ticker).toBe('AAPL')
    })

    it('validateRemoveTicker — throws on missing user_id', () => {
      expect(() => watchlistService.validateRemoveTicker('', 'AAPL')).toThrow('Invalid or missing user_id')
    })

    it('validateRemoveTicker — throws on missing ticker', () => {
      expect(() => watchlistService.validateRemoveTicker(testUserId, '')).toThrow('Invalid or missing ticker')
    })
  })

  describe('User Controller Error Responses', () => {
    it('POST / — returns 400 on invalid name', async () => {
      const res = await request(userApp).post('/').send({ name: '', ntfy_topic: 'test' })
      expect(res.status).toBe(400)
      expect(res.body.error).toBeTruthy()
    })

    it('POST / — returns 400 on missing ntfy_topic', async () => {
      const res = await request(userApp).post('/').send({ name: 'Test' })
      expect(res.status).toBe(400)
      expect(res.body.error).toBeTruthy()
    })

    it('GET /:userId — returns 404 on user not found', async () => {
      const res = await request(userApp).get('/nonexistent')
      expect(res.status).toBe(404)
      expect(res.body.error).toBe('User not found')
    })

    it('PATCH /:userId — returns 400 on no valid fields', async () => {
      const res = await request(userApp).patch('/' + testUserId).send({})
      expect(res.status).toBe(400)
      expect(res.body.error).toBeTruthy()
    })

    it('PATCH /:userId — returns 400 on invalid name', async () => {
      const res = await request(userApp).patch('/' + testUserId).send({ name: '' })
      expect(res.status).toBe(400)
      expect(res.body.error).toBeTruthy()
    })
  })

  describe('Briefing Controller Error Responses', () => {
    it('POST / — returns 400 on missing user_id', async () => {
      const res = await request(briefingApp)
        .post('/')
        .send({ full_summary: 'Full', short_summary: 'Short' })
      expect(res.status).toBe(400)
      expect(res.body.error).toBeTruthy()
    })

    it('POST / — returns 400 on missing full_summary', async () => {
      const res = await request(briefingApp).post('/').send({ user_id: testUserId, short_summary: 'Short' })
      expect(res.status).toBe(400)
      expect(res.body.error).toBeTruthy()
    })

    it('POST / — returns 400 on missing short_summary', async () => {
      const res = await request(briefingApp)
        .post('/')
        .send({ user_id: testUserId, full_summary: 'Full' })
      expect(res.status).toBe(400)
      expect(res.body.error).toBeTruthy()
    })

    it('GET /:briefingId — returns 404 on briefing not found', async () => {
      const res = await request(briefingApp).get('/nonexistent')
      expect(res.status).toBe(404)
      expect(res.body.error).toBe('Briefing not found')
    })

    it('PATCH /:briefingId — returns 400 on no valid fields', async () => {
      const briefing = await briefingService.create({
        user_id: testUserId,
        full_summary: 'Full',
        short_summary: 'Short',
      })
      const res = await request(briefingApp).patch('/' + briefing.briefing_id).send({})
      expect(res.status).toBe(400)
      expect(res.body.error).toBeTruthy()
    })

    it('PATCH /:briefingId — returns 400 on invalid full_summary', async () => {
      const briefing = await briefingService.create({
        user_id: testUserId,
        full_summary: 'Full',
        short_summary: 'Short',
      })
      const res = await request(briefingApp).patch('/' + briefing.briefing_id).send({ full_summary: '' })
      expect(res.status).toBe(400)
      expect(res.body.error).toBeTruthy()
    })
  })

  describe('Watchlist Controller Error Responses', () => {
    it('POST / — returns 400 on missing user_id', async () => {
      const res = await request(watchlistApp).post('/').send({ ticker: 'AAPL' })
      expect(res.status).toBe(400)
      expect(res.body.error).toBeTruthy()
    })

    it('POST / — returns 400 on missing ticker', async () => {
      const res = await request(watchlistApp).post('/').send({ user_id: testUserId })
      expect(res.status).toBe(400)
      expect(res.body.error).toBeTruthy()
    })

    it('POST /list — returns 400 on missing user_id', async () => {
      const res = await request(watchlistApp).post('/list').send({})
      expect(res.status).toBe(400)
      expect(res.body.error).toBeTruthy()
    })

    it('POST /check — returns 400 on missing user_id', async () => {
      const res = await request(watchlistApp).post('/check').send({ ticker: 'AAPL' })
      expect(res.status).toBe(400)
      expect(res.body.error).toBeTruthy()
    })

    it('POST /check — returns 400 on missing ticker', async () => {
      const res = await request(watchlistApp).post('/check').send({ user_id: testUserId })
      expect(res.status).toBe(400)
      expect(res.body.error).toBeTruthy()
    })

    it('DELETE / — returns 400 on missing user_id', async () => {
      const res = await request(watchlistApp).delete('/').send({ ticker: 'AAPL' })
      expect(res.status).toBe(400)
      expect(res.body.error).toBeTruthy()
    })
  })

  describe('Input Sanitization', () => {
    it('User creation sanitizes whitespace from name', async () => {
      const res = await request(userApp)
        .post('/')
        .send({ name: '  Test User  ', ntfy_topic: '  topic  ' })
      expect(res.status).toBe(201)
      expect(res.body.name).toBe('Test User')
      expect(res.body.ntfy_topic).toBe('topic')
      createdUserIds.push(res.body.user_id)
    })

    it('Briefing creation sanitizes whitespace', async () => {
      const res = await request(briefingApp)
        .post('/')
        .send({
          user_id: testUserId,
          full_summary: '  Full Summary  ',
          short_summary: '  Short  ',
        })
      expect(res.status).toBe(201)
      expect(res.body.full_summary).toBe('Full Summary')
      expect(res.body.short_summary).toBe('Short')
    })

    it('Watchlist ticker is converted to uppercase', async () => {
      const res = await request(watchlistApp)
        .post('/')
        .send({ user_id: testUserId, ticker: 'aapl' })
      expect(res.status).toBe(200)
      expect(res.body.ticker).toBe('AAPL')
    })

    it('User update sanitizes whitespace', async () => {
      const res = await request(userApp)
        .patch('/' + testUserId)
        .send({ name: '  Updated  ' })
      expect(res.status).toBe(200)
      expect(res.body.name).toBe('Updated')
    })

    it('Briefing update sanitizes whitespace', async () => {
      const briefing = await briefingService.create({
        user_id: testUserId,
        full_summary: 'Full',
        short_summary: 'Short',
      })
      const res = await request(briefingApp)
        .patch('/' + briefing.briefing_id)
        .send({ full_summary: '  Updated Full  ' })
      expect(res.status).toBe(200)
      expect(res.body.full_summary).toBe('Updated Full')
    })
  })
})
