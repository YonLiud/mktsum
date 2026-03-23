import { describe, test, expect, beforeEach } from 'bun:test'
import app from '../app'
import { cleanDb, insertUser } from './helpers'

beforeEach(async () => {
  await cleanDb()
})

// ---------------------------------------------------------------------------
// GET /v1/users
// ---------------------------------------------------------------------------
describe('GET /v1/users', () => {
  test('returns an empty array when no users exist', async () => {
    const res = await app.request('/v1/users')
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual([])
  })

  test('returns all users', async () => {
    await insertUser({ name: 'Alice', ntfy_topic: 'alice' })
    await insertUser({ name: 'Bob', ntfy_topic: 'bob' })

    const res = await app.request('/v1/users')
    expect(res.status).toBe(200)

    const data = (await res.json()) as any[]
    expect(data).toHaveLength(2)
    expect(data.map((u: any) => u.name).sort()).toEqual(['Alice', 'Bob'])
  })
})

// ---------------------------------------------------------------------------
// POST /v1/users
// ---------------------------------------------------------------------------
describe('POST /v1/users', () => {
  test('creates a user and returns 201 with the user data', async () => {
    const res = await app.request('/v1/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Alice', ntfy_topic: 'alice-topic' }),
    })

    expect(res.status).toBe(201)

    const user = (await res.json()) as any
    expect(user.user_id).toBeDefined()
    expect(user.name).toBe('Alice')
    expect(user.ntfy_topic).toBe('alice-topic')
    expect(user.created_at).toBeDefined()
  })

  test('persists the created user (visible in GET /v1/users)', async () => {
    await app.request('/v1/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Charlie', ntfy_topic: 'charlie' }),
    })

    const res = await app.request('/v1/users')
    const data = (await res.json()) as any[]
    expect(data).toHaveLength(1)
    expect(data[0].name).toBe('Charlie')
  })
})

// ---------------------------------------------------------------------------
// GET /v1/users/:id
// ---------------------------------------------------------------------------
describe('GET /v1/users/:id', () => {
  test('returns the user with empty briefings and watchlist arrays', async () => {
    const user = await insertUser({ name: 'Diana' })

    const res = await app.request(`/v1/users/${user.user_id}`)
    expect(res.status).toBe(200)

    const data = (await res.json()) as any
    expect(data.user_id).toBe(user.user_id)
    expect(data.name).toBe('Diana')
    expect(Array.isArray(data.briefings)).toBe(true)
    expect(Array.isArray(data.watchlist)).toBe(true)
    expect(data.briefings).toHaveLength(0)
    expect(data.watchlist).toHaveLength(0)
  })

  test('returns 404 for a nonexistent user', async () => {
    const res = await app.request('/v1/users/doesnotexist')
    expect(res.status).toBe(404)
    expect((await res.json() as any).error).toBe('User not found')
  })
})

// ---------------------------------------------------------------------------
// PATCH /v1/users/:id
// ---------------------------------------------------------------------------
describe('PATCH /v1/users/:id', () => {
  test('updates the user name', async () => {
    const user = await insertUser({ name: 'Eve', ntfy_topic: 'eve' })

    const res = await app.request(`/v1/users/${user.user_id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Evelyn' }),
    })

    expect(res.status).toBe(200)
    const updated = (await res.json()) as any
    expect(updated.name).toBe('Evelyn')
    expect(updated.ntfy_topic).toBe('eve')
  })

  test('updates ntfy_topic only', async () => {
    const user = await insertUser({ name: 'Frank', ntfy_topic: 'old-topic' })

    const res = await app.request(`/v1/users/${user.user_id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ntfy_topic: 'new-topic' }),
    })

    expect(res.status).toBe(200)
    const updated = (await res.json()) as any
    expect(updated.name).toBe('Frank')
    expect(updated.ntfy_topic).toBe('new-topic')
  })

  test('returns 404 for a nonexistent user', async () => {
    const res = await app.request('/v1/users/doesnotexist', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'New Name' }),
    })

    expect(res.status).toBe(404)
    expect((await res.json() as any).error).toBe('User not found')
  })
})

// ---------------------------------------------------------------------------
// DELETE /v1/users/:id
// ---------------------------------------------------------------------------
describe('DELETE /v1/users/:id', () => {
  test('deletes a user and returns { success: true }', async () => {
    const user = await insertUser()

    const res = await app.request(`/v1/users/${user.user_id}`, {
      method: 'DELETE',
    })

    expect(res.status).toBe(200)
    expect((await res.json() as any).success).toBe(true)
  })

  test('user is no longer returned after deletion', async () => {
    const user = await insertUser()
    await app.request(`/v1/users/${user.user_id}`, { method: 'DELETE' })

    const res = await app.request(`/v1/users/${user.user_id}`)
    expect(res.status).toBe(404)
  })

  test('returns 404 for a nonexistent user', async () => {
    const res = await app.request('/v1/users/doesnotexist', { method: 'DELETE' })
    expect(res.status).toBe(404)
    expect((await res.json() as any).error).toBe('User not found')
  })
})
