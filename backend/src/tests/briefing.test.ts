import 'dotenv/config'
import { describe, it, expect, afterEach, afterAll, beforeEach } from 'vitest'
import { prisma } from '../lib/prisma.ts'
import { briefingService } from '../services/briefingService.ts'
import { userService } from '../services/userService.ts'
import express from 'express'
import request from 'supertest'
import briefingRouter from '../routes/internal/briefings.ts'

const app = express()
app.use(express.json())
app.use(briefingRouter)
app.use((err: any, _req: any, res: any, _next: any) => {
  res.status(500).json({ error: err.message })
})

let testUserId: string
const createdUserIds: string[] = []

beforeEach(async () => {
  const user = await userService.create({ name: 'Test_B_User', ntfy_topic: 'test' })
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

describe('briefingService', () => {
  it('create — generates id and returns briefing', async () => {
    const result = await briefingService.create({
      user_id: testUserId,
      full_summary: 'Test_Full',
      short_summary: 'Test_Short',
    })
    expect(result.briefing_id).toBeTruthy()
    expect(result.briefing_id.length).toBe(12)
    expect(result.user_id).toBe(testUserId)
    expect(result.full_summary).toBe('Test_Full')
    expect(result.short_summary).toBe('Test_Short')
    expect(result.notif_sent).toBe(false)
  })

  it('create — handles notif_sent as true', async () => {
    const result = await briefingService.create({
      user_id: testUserId,
      full_summary: 'Test_Full',
      short_summary: 'Test_Short',
      notif_sent: true,
    })
    expect(result.notif_sent).toBe(true)
  })

  it('create — handles notif_sent as false', async () => {
    const result = await briefingService.create({
      user_id: testUserId,
      full_summary: 'Test_Full',
      short_summary: 'Test_Short',
      notif_sent: false,
    })
    expect(result.notif_sent).toBe(false)
  })

  it('create — stores sources as JSON string', async () => {
    const sources = ['Source1', 'Source2', 'Source3']
    const result = await briefingService.create({
      user_id: testUserId,
      full_summary: 'Test_Full',
      short_summary: 'Test_Short',
      sources: JSON.stringify(sources),
    })
    expect(result.sources).toBe(JSON.stringify(sources))
  })

  it('getById — returns correct briefing', async () => {
    const created = await briefingService.create({
      user_id: testUserId,
      full_summary: 'Test_Get',
      short_summary: 'Get',
    })
    const found = await briefingService.getById(created.briefing_id)
    expect(found).toEqual(created)
  })

  it('getAll — includes created briefings', async () => {
    await briefingService.create({
      user_id: testUserId,
      full_summary: 'Test_All1',
      short_summary: 'All1',
    })
    await briefingService.create({
      user_id: testUserId,
      full_summary: 'Test_All2',
      short_summary: 'All2',
    })
    const all = await briefingService.getAll()
    expect(all.length).toBeGreaterThanOrEqual(2)
  })

  it('getByUser — returns only user briefings', async () => {
    const user2 = await userService.create({ name: 'Test_B_User2', ntfy_topic: 'test2' })
    createdUserIds.push(user2.user_id)
    await briefingService.create({
      user_id: testUserId,
      full_summary: 'Test_User1',
      short_summary: 'U1',
    })
    await briefingService.create({
      user_id: user2.user_id,
      full_summary: 'Test_User2',
      short_summary: 'U2',
    })
    const userBriefings = await briefingService.getByUser(testUserId)
    expect(userBriefings.length).toBe(1)
    expect(userBriefings[0]!.user_id).toBe(testUserId)
  })

  it('update — modifies briefing', async () => {
    const created = await briefingService.create({
      user_id: testUserId,
      full_summary: 'Old_Full',
      short_summary: 'Old_Short',
    })
    const updated = await briefingService.update(created.briefing_id, {
      full_summary: 'New_Full',
    })
    expect(updated.full_summary).toBe('New_Full')
    expect(updated.short_summary).toBe('Old_Short')
  })

  it('update — updates notif_sent to true', async () => {
    const created = await briefingService.create({
      user_id: testUserId,
      full_summary: 'Test_Full',
      short_summary: 'Test_Short',
      notif_sent: false,
    })
    const updated = await briefingService.update(created.briefing_id, {
      notif_sent: true,
    })
    expect(updated.notif_sent).toBe(true)
  })

  it('update — updates notif_sent to false', async () => {
    const created = await briefingService.create({
      user_id: testUserId,
      full_summary: 'Test_Full',
      short_summary: 'Test_Short',
      notif_sent: true,
    })
    const updated = await briefingService.update(created.briefing_id, {
      notif_sent: false,
    })
    expect(updated.notif_sent).toBe(false)
  })

  it('update — updates sources', async () => {
    const created = await briefingService.create({
      user_id: testUserId,
      full_summary: 'Test_Full',
      short_summary: 'Test_Short',
    })
    const newSources = ['NewSource1', 'NewSource2']
    const updated = await briefingService.update(created.briefing_id, {
      sources: JSON.stringify(newSources),
    })
    expect(updated.sources).toBe(JSON.stringify(newSources))
  })

  it('delete — removes briefing', async () => {
    const created = await briefingService.create({
      user_id: testUserId,
      full_summary: 'Test_Delete',
      short_summary: 'Delete',
    })
    await briefingService.delete(created.briefing_id)
    const found = await briefingService.getById(created.briefing_id)
    expect(found).toBeNull()
  })

  it('getLatestByUser — returns most recent briefing', async () => {
    await briefingService.create({
      user_id: testUserId,
      full_summary: 'First',
      short_summary: 'F1',
    })
    await new Promise(resolve => setTimeout(resolve, 10))
    const latest = await briefingService.create({
      user_id: testUserId,
      full_summary: 'Latest',
      short_summary: 'L1',
    })
    const result = await briefingService.getLatestByUser(testUserId)
    expect(result).toBeTruthy()
    expect(result!.briefing_id).toBe(latest.briefing_id)
    expect(result!.full_summary).toBe('Latest')
  })
})

describe('briefingController (HTTP)', () => {
  it('POST / — creates briefing with 201', async () => {
    const res = await request(app)
      .post('/')
      .send({
        user_id: testUserId,
        full_summary: 'Test_HTTP_Full',
        short_summary: 'Test_HTTP_Short',
      })
    expect(res.status).toBe(201)
    expect(res.body.briefing_id).toBeTruthy()
    expect(res.body.full_summary).toBe('Test_HTTP_Full')
    expect(res.body.notif_sent).toBe(false)
  })

  it('POST / — creates briefing with notif_sent boolean', async () => {
    const res = await request(app)
      .post('/')
      .send({
        user_id: testUserId,
        full_summary: 'Test_HTTP_Full',
        short_summary: 'Test_HTTP_Short',
        notif_sent: true,
      })
    expect(res.status).toBe(201)
    expect(res.body.notif_sent).toBe(true)
  })

  it('POST / — creates briefing with notif_sent string conversion', async () => {
    const res = await request(app)
      .post('/')
      .send({
        user_id: testUserId,
        full_summary: 'Test_HTTP_Full',
        short_summary: 'Test_HTTP_Short',
        notif_sent: 'true',
      })
    expect(res.status).toBe(201)
    expect(res.body.notif_sent).toBe(true)
  })

  it('POST / — creates briefing with sources array', async () => {
    const sources = ['Source1', 'Source2']
    const res = await request(app)
      .post('/')
      .send({
        user_id: testUserId,
        full_summary: 'Test_HTTP_Full',
        short_summary: 'Test_HTTP_Short',
        sources: sources,
      })
    expect(res.status).toBe(201)
    expect(res.body.sources).toBe(JSON.stringify(sources))
  })

  it('POST / — creates briefing with sources string', async () => {
    const sources = ['Source1', 'Source2']
    const sourceString = JSON.stringify(sources)
    const res = await request(app)
      .post('/')
      .send({
        user_id: testUserId,
        full_summary: 'Test_HTTP_Full',
        short_summary: 'Test_HTTP_Short',
        sources: sourceString,
      })
    expect(res.status).toBe(201)
    expect(res.body.sources).toBe(sourceString)
  })

  it('GET / — returns briefings array', async () => {
    await briefingService.create({
      user_id: testUserId,
      full_summary: 'Test_Get_All',
      short_summary: 'GA',
    })
    const res = await request(app).get('/')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('GET /:briefingId — returns correct briefing', async () => {
    const created = await briefingService.create({
      user_id: testUserId,
      full_summary: 'Test_Get_One',
      short_summary: 'GO',
    })
    const res = await request(app).get(`/${created.briefing_id}`)
    expect(res.status).toBe(200)
    expect(res.body.briefing_id).toBe(created.briefing_id)
    expect(res.body.full_summary).toBe('Test_Get_One')
  })

  it('GET /user/:userId — returns user briefings', async () => {
    await briefingService.create({
      user_id: testUserId,
      full_summary: 'Test_User_Briefing',
      short_summary: 'UB',
    })
    const res = await request(app).get(`/user/${testUserId}`)
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBe(1)
    expect(res.body[0].user_id).toBe(testUserId)
  })

  it('PATCH /:briefingId — updates briefing', async () => {
    const created = await briefingService.create({
      user_id: testUserId,
      full_summary: 'Test_Patch_Old',
      short_summary: 'Old',
    })
    const res = await request(app)
      .patch(`/${created.briefing_id}`)
      .send({ full_summary: 'Test_Patch_New' })
    expect(res.status).toBe(200)
    expect(res.body.full_summary).toBe('Test_Patch_New')
    expect(res.body.short_summary).toBe('Old')
  })

  it('PATCH /:briefingId — updates notif_sent boolean', async () => {
    const created = await briefingService.create({
      user_id: testUserId,
      full_summary: 'Test_Patch_Full',
      short_summary: 'TP',
      notif_sent: false,
    })
    const res = await request(app)
      .patch(`/${created.briefing_id}`)
      .send({ notif_sent: true })
    expect(res.status).toBe(200)
    expect(res.body.notif_sent).toBe(true)
  })

  it('PATCH /:briefingId — updates notif_sent string conversion', async () => {
    const created = await briefingService.create({
      user_id: testUserId,
      full_summary: 'Test_Patch_Full',
      short_summary: 'TP',
      notif_sent: false,
    })
    const res = await request(app)
      .patch(`/${created.briefing_id}`)
      .send({ notif_sent: 'true' })
    expect(res.status).toBe(200)
    expect(res.body.notif_sent).toBe(true)
  })

  it('PATCH /:briefingId — updates sources array', async () => {
    const created = await briefingService.create({
      user_id: testUserId,
      full_summary: 'Test_Patch_Full',
      short_summary: 'TP',
    })
    const newSources = ['NewSource1', 'NewSource2']
    const res = await request(app)
      .patch(`/${created.briefing_id}`)
      .send({ sources: newSources })
    expect(res.status).toBe(200)
    expect(res.body.sources).toBe(JSON.stringify(newSources))
  })

  it('GET /user/:userId/latest — returns latest briefing', async () => {
    await briefingService.create({
      user_id: testUserId,
      full_summary: 'First_Brief',
      short_summary: 'FB',
    })
    await new Promise(resolve => setTimeout(resolve, 10))
    const latest = await briefingService.create({
      user_id: testUserId,
      full_summary: 'Latest_Brief',
      short_summary: 'LB',
    })
    const res = await request(app).get(`/user/${testUserId}/latest`)
    expect(res.status).toBe(200)
    expect(res.body.briefing_id).toBe(latest.briefing_id)
    expect(res.body.full_summary).toBe('Latest_Brief')
  })

  it('DELETE /:briefingId — removes briefing', async () => {
    const created = await briefingService.create({
      user_id: testUserId,
      full_summary: 'Test_Delete',
      short_summary: 'Del',
    })
    const res = await request(app).delete(`/${created.briefing_id}`)
    expect(res.status).toBe(200)
    const found = await briefingService.getById(created.briefing_id)
    expect(found).toBeNull()
  })
})
