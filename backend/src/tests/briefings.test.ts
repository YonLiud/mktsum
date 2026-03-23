import { describe, test, expect, beforeEach } from 'bun:test'
import app from '../app'
import { cleanDb, insertUser, insertBriefing } from './helpers'

beforeEach(async () => {
  await cleanDb()
})

// ---------------------------------------------------------------------------
// POST /v1/briefings
// ---------------------------------------------------------------------------
describe('POST /v1/briefings', () => {
  test('creates a briefing and returns 201', async () => {
    const user = await insertUser()

    const res = await app.request('/v1/briefings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.user_id,
        full_summary: 'Markets rallied today.',
        short_summary: 'Markets up.',
      }),
    })

    expect(res.status).toBe(201)
    const briefing = (await res.json()) as any
    expect(briefing.briefing_id).toBeDefined()
    expect(briefing.user_id).toBe(user.user_id)
    expect(briefing.full_summary).toBe('Markets rallied today.')
    expect(briefing.short_summary).toBe('Markets up.')
    expect(briefing.notif_sent).toBe(false)
  })

  test('creates a briefing with optional sources array', async () => {
    const user = await insertUser()

    const res = await app.request('/v1/briefings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.user_id,
        full_summary: 'Full text.',
        short_summary: 'Short.',
        sources: [
          { ticker: 'AAPL', title: 'Article 1', url: 'https://example.com/article1' },
          { ticker: 'GOOG', title: 'Article 2', url: 'https://example.com/article2' },
        ],
      }),
    })

    expect(res.status).toBe(201)
    const briefing = (await res.json()) as any
    expect(briefing.sources).toEqual([
      { ticker: 'AAPL', title: 'Article 1', url: 'https://example.com/article1' },
      { ticker: 'GOOG', title: 'Article 2', url: 'https://example.com/article2' },
    ])
  })
})

// ---------------------------------------------------------------------------
// GET /v1/briefings/:id
// ---------------------------------------------------------------------------
describe('GET /v1/briefings/:id', () => {
  test('returns the briefing for a valid id', async () => {
    const user = await insertUser()
    const briefing = await insertBriefing(user.user_id)

    const res = await app.request(`/v1/briefings/${briefing.briefing_id}`)
    expect(res.status).toBe(200)

    const data = (await res.json()) as any
    expect(data.briefing_id).toBe(briefing.briefing_id)
    expect(data.user_id).toBe(user.user_id)
  })

  test('returns 404 for a nonexistent briefing id', async () => {
    const res = await app.request('/v1/briefings/doesnotexist')
    expect(res.status).toBe(404)
    expect((await res.json() as any).error).toBe('Briefing not found')
  })
})

// ---------------------------------------------------------------------------
// GET /v1/briefings/user/:userId
// ---------------------------------------------------------------------------
describe('GET /v1/briefings/user/:userId', () => {
  test('returns an empty array when user has no briefings', async () => {
    const user = await insertUser()

    const res = await app.request(`/v1/briefings/user/${user.user_id}`)
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual([])
  })

  test('returns all briefings for the user', async () => {
    const user = await insertUser()
    await insertBriefing(user.user_id, { short_summary: 'First' })
    await insertBriefing(user.user_id, { short_summary: 'Second' })

    const res = await app.request(`/v1/briefings/user/${user.user_id}`)
    expect(res.status).toBe(200)

    const data = (await res.json()) as any[]
    expect(data).toHaveLength(2)
  })

  test('does not return briefings belonging to another user', async () => {
    const user1 = await insertUser({ name: 'User1' })
    const user2 = await insertUser({ name: 'User2' })
    await insertBriefing(user2.user_id)

    const res = await app.request(`/v1/briefings/user/${user1.user_id}`)
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// GET /v1/briefings/user/:userId/latest
// ---------------------------------------------------------------------------
describe('GET /v1/briefings/user/:userId/latest', () => {
  test('returns the most recently created briefing', async () => {
    const user = await insertUser()
    await insertBriefing(user.user_id, { short_summary: 'Older briefing' })
    // Small delay to ensure distinct created_at timestamps
    await Bun.sleep(10)
    await insertBriefing(user.user_id, { short_summary: 'Newer briefing' })

    const res = await app.request(`/v1/briefings/user/${user.user_id}/latest`)
    expect(res.status).toBe(200)

    const latest = (await res.json()) as any
    expect(latest.short_summary).toBe('Newer briefing')
  })

  test('returns 404 when user has no briefings', async () => {
    const user = await insertUser()

    const res = await app.request(`/v1/briefings/user/${user.user_id}/latest`)
    expect(res.status).toBe(404)
    expect((await res.json() as any).error).toBe('No briefings found')
  })
})

// ---------------------------------------------------------------------------
// DELETE /v1/briefings/:id
// ---------------------------------------------------------------------------
describe('DELETE /v1/briefings/:id', () => {
  test('deletes a briefing and returns { success: true }', async () => {
    const user = await insertUser()
    const briefing = await insertBriefing(user.user_id)

    const res = await app.request(`/v1/briefings/${briefing.briefing_id}`, {
      method: 'DELETE',
    })

    expect(res.status).toBe(200)
    expect((await res.json() as any).success).toBe(true)
  })

  test('briefing is no longer returned after deletion', async () => {
    const user = await insertUser()
    const briefing = await insertBriefing(user.user_id)
    await app.request(`/v1/briefings/${briefing.briefing_id}`, { method: 'DELETE' })

    const res = await app.request(`/v1/briefings/user/${user.user_id}`)
    expect(await res.json()).toEqual([])
  })

  test('returns 404 for a nonexistent briefing', async () => {
    const res = await app.request('/v1/briefings/doesnotexist', { method: 'DELETE' })
    expect(res.status).toBe(404)
    expect((await res.json() as any).error).toBe('Briefing not found')
  })
})

// ---------------------------------------------------------------------------
// GET /internal/briefings/pending
// ---------------------------------------------------------------------------
describe('GET /internal/briefings/pending', () => {
  test('returns only unsent briefings', async () => {
    const user = await insertUser()
    await insertBriefing(user.user_id, { short_summary: 'Unsent', notif_sent: false })
    await insertBriefing(user.user_id, { short_summary: 'Already sent', notif_sent: true })

    const res = await app.request('/internal/briefings/pending')
    expect(res.status).toBe(200)

    const data = (await res.json()) as any[]
    expect(data).toHaveLength(1)
    expect(data[0].short_summary).toBe('Unsent')
    expect(data[0].notif_sent).toBe(false)
  })

  test('returns an empty array when all briefings are sent', async () => {
    const user = await insertUser()
    await insertBriefing(user.user_id, { notif_sent: true })

    const res = await app.request('/internal/briefings/pending')
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// POST /internal/briefings
// ---------------------------------------------------------------------------
describe('POST /internal/briefings', () => {
  test('creates a briefing and returns 201', async () => {
    const user = await insertUser()

    const res = await app.request('/internal/briefings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.user_id,
        full_summary: 'Internal full summary.',
        short_summary: 'Internal short.',
      }),
    })

    expect(res.status).toBe(201)
    const briefing = (await res.json()) as any
    expect(briefing.briefing_id).toBeDefined()
    expect(briefing.user_id).toBe(user.user_id)
    expect(briefing.full_summary).toBe('Internal full summary.')
    expect(briefing.short_summary).toBe('Internal short.')
    expect(briefing.notif_sent).toBe(false)
  })

  test('creates a briefing with sources and returns 201', async () => {
    const user = await insertUser()

    const res = await app.request('/internal/briefings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.user_id,
        full_summary: 'Full with sources.',
        short_summary: 'Short.',
        sources: [{ ticker: 'AAPL', title: 'Apple news', url: 'https://example.com' }],
      }),
    })

    expect(res.status).toBe(201)
    const briefing = (await res.json()) as any
    expect(briefing.sources).toEqual([
      { ticker: 'AAPL', title: 'Apple news', url: 'https://example.com' },
    ])
  })

  test('returns 400 when required fields are missing', async () => {
    const res = await app.request('/internal/briefings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: 'someuser' }),
    })

    expect(res.status).toBe(400)
    expect((await res.json() as any).error).toBeDefined()
  })
})

// ---------------------------------------------------------------------------
// POST /internal/briefings/bulk
// ---------------------------------------------------------------------------
describe('POST /internal/briefings/bulk', () => {
  test('bulk creates briefings and returns 201 with all created records', async () => {
    const user1 = await insertUser({ name: 'User1' })
    const user2 = await insertUser({ name: 'User2' })

    const res = await app.request('/internal/briefings/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([
        { user_id: user1.user_id, full_summary: 'Full A', short_summary: 'Short A' },
        { user_id: user2.user_id, full_summary: 'Full B', short_summary: 'Short B' },
      ]),
    })

    expect(res.status).toBe(201)
    const data = (await res.json()) as any[]
    expect(data).toHaveLength(2)
    expect(data.every((b: any) => b.briefing_id)).toBe(true)
    expect(data.every((b: any) => b.notif_sent === false)).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// PATCH /internal/briefings/:id/sent
// ---------------------------------------------------------------------------
describe('PATCH /internal/briefings/:id/sent', () => {
  test('marks a briefing as sent', async () => {
    const user = await insertUser()
    const briefing = await insertBriefing(user.user_id, { notif_sent: false })

    const res = await app.request(`/internal/briefings/${briefing.briefing_id}/sent`, {
      method: 'PATCH',
    })

    expect(res.status).toBe(200)
    const updated = (await res.json()) as any
    expect(updated.notif_sent).toBe(true)
    expect(updated.briefing_id).toBe(briefing.briefing_id)
  })

  test('returns 404 for a nonexistent briefing', async () => {
    const res = await app.request('/internal/briefings/doesnotexist/sent', {
      method: 'PATCH',
    })

    expect(res.status).toBe(404)
    expect((await res.json() as any).error).toBe('Briefing not found')
  })
})
