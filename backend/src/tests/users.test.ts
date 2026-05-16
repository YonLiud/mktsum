import { describe, test, expect, beforeEach } from 'bun:test'
import app from '../app'
import { cleanDb, insertUser, createSession, authHeader } from './helpers'

beforeEach(async () => {
  await cleanDb()
})

// ---------------------------------------------------------------------------
// POST /v1/users (registration — no auth required)
// ---------------------------------------------------------------------------
describe('POST /v1/users', () => {
  test('creates a user and returns 201', async () => {
    const res = await app.request('/v1/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'alice', name: 'Alice', password: 'password123', ntfy_topic: 'alice-topic', terms_accepted: true }),
    })

    expect(res.status).toBe(201)
    const user = (await res.json()) as any
    expect(user.user_id).toBeDefined()
    expect(user.username).toBe('alice')
    expect(user.name).toBe('Alice')
    expect(user.password_hash).toBeUndefined()
  })

  test('returns 400 when username is missing', async () => {
    const res = await app.request('/v1/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Alice', password: 'password123', ntfy_topic: 'alice' }),
    })
    expect(res.status).toBe(400)
  })

  test('returns 400 when password is missing', async () => {
    const res = await app.request('/v1/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'alice', name: 'Alice', ntfy_topic: 'alice' }),
    })
    expect(res.status).toBe(400)
  })
})

// ---------------------------------------------------------------------------
// GET /v1/users (admin only)
// ---------------------------------------------------------------------------
describe('GET /v1/users', () => {
  test('returns 401 without a token', async () => {
    const res = await app.request('/v1/users')
    expect(res.status).toBe(401)
  })

  test('returns 403 for a non-admin user', async () => {
    const user = await insertUser()
    const token = await createSession(user.user_id)

    const res = await app.request('/v1/users', { headers: authHeader(token) })
    expect(res.status).toBe(403)
  })

  test('returns all users for admin', async () => {
    const admin = await insertUser({ role: 'admin' })
    const token = await createSession(admin.user_id)
    await insertUser({ name: 'Alice' })
    await insertUser({ name: 'Bob' })

    const res = await app.request('/v1/users', { headers: authHeader(token) })
    expect(res.status).toBe(200)
    const data = (await res.json()) as any[]
    expect(data.length).toBeGreaterThanOrEqual(3) // admin + Alice + Bob
  })
})

// ---------------------------------------------------------------------------
// GET /v1/users/:id
// ---------------------------------------------------------------------------
describe('GET /v1/users/:id', () => {
  test('returns 401 without a token', async () => {
    const user = await insertUser()
    const res = await app.request(`/v1/users/${user.user_id}`)
    expect(res.status).toBe(401)
  })

  test('returns 403 when accessing another user', async () => {
    const user1 = await insertUser()
    const user2 = await insertUser()
    const token = await createSession(user1.user_id)

    const res = await app.request(`/v1/users/${user2.user_id}`, { headers: authHeader(token) })
    expect(res.status).toBe(403)
  })

  test('returns the user for self', async () => {
    const user = await insertUser({ name: 'Diana' })
    const token = await createSession(user.user_id)

    const res = await app.request(`/v1/users/${user.user_id}`, { headers: authHeader(token) })
    expect(res.status).toBe(200)
    const data = (await res.json()) as any
    expect(data.user_id).toBe(user.user_id)
    expect(data.name).toBe('Diana')
    expect(Array.isArray(data.briefings)).toBe(true)
    expect(Array.isArray(data.watchlist)).toBe(true)
  })

  test('returns the user for admin', async () => {
    const admin = await insertUser({ role: 'admin' })
    const target = await insertUser({ name: 'Target' })
    const token = await createSession(admin.user_id)

    const res = await app.request(`/v1/users/${target.user_id}`, { headers: authHeader(token) })
    expect(res.status).toBe(200)
  })

  test('returns 404 for a nonexistent user', async () => {
    const admin = await insertUser({ role: 'admin' })
    const token = await createSession(admin.user_id)

    const res = await app.request('/v1/users/doesnotexist', { headers: authHeader(token) })
    expect(res.status).toBe(404)
  })
})

// ---------------------------------------------------------------------------
// PATCH /v1/users/:id
// ---------------------------------------------------------------------------
describe('PATCH /v1/users/:id', () => {
  test('returns 401 without a token', async () => {
    const user = await insertUser()
    const res = await app.request(`/v1/users/${user.user_id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'New Name' }),
    })
    expect(res.status).toBe(401)
  })

  test('returns 403 when patching another user', async () => {
    const user1 = await insertUser()
    const user2 = await insertUser()
    const token = await createSession(user1.user_id)

    const res = await app.request(`/v1/users/${user2.user_id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeader(token) },
      body: JSON.stringify({ name: 'Hacked' }),
    })
    expect(res.status).toBe(403)
  })

  test('updates name for self', async () => {
    const user = await insertUser({ name: 'Eve' })
    const token = await createSession(user.user_id)

    const res = await app.request(`/v1/users/${user.user_id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeader(token) },
      body: JSON.stringify({ name: 'Evelyn' }),
    })
    expect(res.status).toBe(200)
    expect((await res.json() as any).name).toBe('Evelyn')
  })
})

// ---------------------------------------------------------------------------
// DELETE /v1/users/:id (admin only)
// ---------------------------------------------------------------------------
describe('DELETE /v1/users/:id', () => {
  test('returns 401 without a token', async () => {
    const user = await insertUser()
    const res = await app.request(`/v1/users/${user.user_id}`, { method: 'DELETE' })
    expect(res.status).toBe(401)
  })

  test('returns 403 for a non-admin user', async () => {
    const user1 = await insertUser()
    const user2 = await insertUser()
    const token = await createSession(user1.user_id)

    const res = await app.request(`/v1/users/${user2.user_id}`, {
      method: 'DELETE',
      headers: authHeader(token),
    })
    expect(res.status).toBe(403)
  })

  test('deletes user for admin', async () => {
    const admin = await insertUser({ role: 'admin' })
    const target = await insertUser()
    const token = await createSession(admin.user_id)

    const res = await app.request(`/v1/users/${target.user_id}`, {
      method: 'DELETE',
      headers: authHeader(token),
    })
    expect(res.status).toBe(200)
    expect((await res.json() as any).success).toBe(true)
  })
})
