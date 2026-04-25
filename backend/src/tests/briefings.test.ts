import { describe, test, expect, beforeEach } from 'bun:test'
import app from '../app'
import { cleanDb, insertUser, insertBriefing, createSession, authHeader } from './helpers'

beforeEach(async () => {
  await cleanDb()
})

// ---------------------------------------------------------------------------
// POST /v1/briefings
// ---------------------------------------------------------------------------
describe('POST /v1/briefings', () => {
  test('returns 401 without a token', async () => {
    const user = await insertUser()
    const res = await app.request('/v1/briefings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.user_id, full_summary: 'Full.', short_summary: 'Short.' }),
    })
    expect(res.status).toBe(401)
  })

  test('creates a briefing and returns 201', async () => {
    const user = await insertUser()
    const token = await createSession(user.user_id)

    const res = await app.request('/v1/briefings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader(token) },
      body: JSON.stringify({ user_id: user.user_id, full_summary: 'Markets rallied.', short_summary: 'Markets up.' }),
    })

    expect(res.status).toBe(201)
    const briefing = (await res.json()) as any
    expect(briefing.briefing_id).toBeDefined()
    expect(briefing.full_summary).toBe('Markets rallied.')
    expect(briefing.notif_sent).toBe(false)
    expect(briefing.is_public).toBe(false)
  })

  test('creates a briefing with optional sources', async () => {
    const user = await insertUser()
    const token = await createSession(user.user_id)

    const res = await app.request('/v1/briefings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader(token) },
      body: JSON.stringify({
        user_id: user.user_id,
        full_summary: 'Full.',
        short_summary: 'Short.',
        sources: [{ ticker: 'AAPL', title: 'Article', url: 'https://example.com' }],
      }),
    })

    expect(res.status).toBe(201)
    expect((await res.json() as any).sources).toEqual([
      { ticker: 'AAPL', title: 'Article', url: 'https://example.com' },
    ])
  })
})

// ---------------------------------------------------------------------------
// GET /v1/briefings/:id
// ---------------------------------------------------------------------------
describe('GET /v1/briefings/:id', () => {
  test('returns 401 for a private briefing without token', async () => {
    const user = await insertUser()
    const briefing = await insertBriefing(user.user_id, { is_public: false })

    const res = await app.request(`/v1/briefings/${briefing.briefing_id}`)
    expect(res.status).toBe(401)
  })

  test('returns 403 for a private briefing accessed by a different user', async () => {
    const owner = await insertUser()
    const other = await insertUser()
    const token = await createSession(other.user_id)
    const briefing = await insertBriefing(owner.user_id, { is_public: false })

    const res = await app.request(`/v1/briefings/${briefing.briefing_id}`, {
      headers: authHeader(token),
    })
    expect(res.status).toBe(403)
  })

  test('returns briefing for the owner', async () => {
    const user = await insertUser()
    const token = await createSession(user.user_id)
    const briefing = await insertBriefing(user.user_id)

    const res = await app.request(`/v1/briefings/${briefing.briefing_id}`, {
      headers: authHeader(token),
    })
    expect(res.status).toBe(200)
    expect((await res.json() as any).briefing_id).toBe(briefing.briefing_id)
  })

  test('returns a public briefing without token (share link)', async () => {
    const user = await insertUser()
    const briefing = await insertBriefing(user.user_id, { is_public: true })

    const res = await app.request(`/v1/briefings/${briefing.briefing_id}`)
    expect(res.status).toBe(200)
    expect((await res.json() as any).briefing_id).toBe(briefing.briefing_id)
  })

  test('returns 404 for a nonexistent briefing', async () => {
    const res = await app.request('/v1/briefings/doesnotexist')
    expect(res.status).toBe(404)
  })
})

// ---------------------------------------------------------------------------
// GET /v1/briefings/user/:userId
// ---------------------------------------------------------------------------
describe('GET /v1/briefings/user/:userId', () => {
  test('returns 401 without a token', async () => {
    const user = await insertUser()
    const res = await app.request(`/v1/briefings/user/${user.user_id}`)
    expect(res.status).toBe(401)
  })

  test('returns 403 when accessing another user\'s briefings', async () => {
    const user1 = await insertUser()
    const user2 = await insertUser()
    const token = await createSession(user1.user_id)

    const res = await app.request(`/v1/briefings/user/${user2.user_id}`, {
      headers: authHeader(token),
    })
    expect(res.status).toBe(403)
  })

  test('returns all briefings for self', async () => {
    const user = await insertUser()
    const token = await createSession(user.user_id)
    await insertBriefing(user.user_id, { short_summary: 'First' })
    await insertBriefing(user.user_id, { short_summary: 'Second' })

    const res = await app.request(`/v1/briefings/user/${user.user_id}`, {
      headers: authHeader(token),
    })
    expect(res.status).toBe(200)
    expect((await res.json() as any[])).toHaveLength(2)
  })
})

// ---------------------------------------------------------------------------
// GET /v1/briefings/user/:userId/latest
// ---------------------------------------------------------------------------
describe('GET /v1/briefings/user/:userId/latest', () => {
  test('returns 401 without a token', async () => {
    const user = await insertUser()
    const res = await app.request(`/v1/briefings/user/${user.user_id}/latest`)
    expect(res.status).toBe(401)
  })

  test('returns the most recently created briefing', async () => {
    const user = await insertUser()
    const token = await createSession(user.user_id)
    await insertBriefing(user.user_id, { short_summary: 'Older' })
    await Bun.sleep(10)
    await insertBriefing(user.user_id, { short_summary: 'Newer' })

    const res = await app.request(`/v1/briefings/user/${user.user_id}/latest`, {
      headers: authHeader(token),
    })
    expect(res.status).toBe(200)
    expect((await res.json() as any).short_summary).toBe('Newer')
  })

  test('returns 404 when user has no briefings', async () => {
    const user = await insertUser()
    const token = await createSession(user.user_id)

    const res = await app.request(`/v1/briefings/user/${user.user_id}/latest`, {
      headers: authHeader(token),
    })
    expect(res.status).toBe(404)
  })
})

// ---------------------------------------------------------------------------
// DELETE /v1/briefings/:id
// ---------------------------------------------------------------------------
describe('DELETE /v1/briefings/:id', () => {
  test('returns 401 without a token', async () => {
    const user = await insertUser()
    const briefing = await insertBriefing(user.user_id)

    const res = await app.request(`/v1/briefings/${briefing.briefing_id}`, { method: 'DELETE' })
    expect(res.status).toBe(401)
  })

  test('deletes a briefing and returns { success: true }', async () => {
    const user = await insertUser()
    const token = await createSession(user.user_id)
    const briefing = await insertBriefing(user.user_id)

    const res = await app.request(`/v1/briefings/${briefing.briefing_id}`, {
      method: 'DELETE',
      headers: authHeader(token),
    })
    expect(res.status).toBe(200)
    expect((await res.json() as any).success).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// GET /internal/briefings/pending
// ---------------------------------------------------------------------------
describe('GET /internal/briefings/pending', () => {
  test('returns only unsent briefings', async () => {
    const user = await insertUser()
    await insertBriefing(user.user_id, { short_summary: 'Unsent', notif_sent: false })
    await insertBriefing(user.user_id, { short_summary: 'Sent', notif_sent: true })

    const res = await app.request('/internal/briefings/pending')
    expect(res.status).toBe(200)
    const data = (await res.json()) as any[]
    expect(data).toHaveLength(1)
    expect(data[0].short_summary).toBe('Unsent')
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
      body: JSON.stringify({ user_id: user.user_id, full_summary: 'Internal full.', short_summary: 'Internal short.' }),
    })

    expect(res.status).toBe(201)
    const briefing = (await res.json()) as any
    expect(briefing.briefing_id).toBeDefined()
    expect(briefing.notif_sent).toBe(false)
  })

  test('returns 400 when required fields are missing', async () => {
    const res = await app.request('/internal/briefings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: 'someuser' }),
    })
    expect(res.status).toBe(400)
  })
})

// ---------------------------------------------------------------------------
// POST /internal/briefings/bulk
// ---------------------------------------------------------------------------
describe('POST /internal/briefings/bulk', () => {
  test('bulk creates briefings and returns 201', async () => {
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
    expect((await res.json() as any).notif_sent).toBe(true)
  })

  test('returns 404 for a nonexistent briefing', async () => {
    const res = await app.request('/internal/briefings/doesnotexist/sent', { method: 'PATCH' })
    expect(res.status).toBe(404)
  })
})
