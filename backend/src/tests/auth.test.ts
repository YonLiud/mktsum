import { describe, test, expect, beforeEach } from 'bun:test'
import app from '../app'
import { cleanDb, insertUser, createSession, authHeader } from './helpers'

beforeEach(async () => {
  await cleanDb()
})

// ---------------------------------------------------------------------------
// POST /v1/auth/login
// ---------------------------------------------------------------------------
describe('POST /v1/auth/login', () => {
  test('returns a token on valid credentials', async () => {
    await insertUser({ username: 'yon', name: 'Yon' })

    const res = await app.request('/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'yon', password: 'password123' }),
    })

    expect(res.status).toBe(200)
    const data = (await res.json()) as any
    expect(data.token).toBeDefined()
    expect(data.username).toBe('yon')
    expect(data.user_id).toBeDefined()
    expect(data.role).toBe('user')
    expect(data.password_hash).toBeUndefined()
  })

  test('returns 401 on wrong password', async () => {
    await insertUser({ username: 'yon' })

    const res = await app.request('/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'yon', password: 'wrongpassword' }),
    })

    expect(res.status).toBe(401)
  })

  test('returns 401 for unknown username', async () => {
    const res = await app.request('/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'nobody', password: 'password123' }),
    })

    expect(res.status).toBe(401)
  })

  test('returns 400 when fields are missing', async () => {
    const res = await app.request('/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'yon' }),
    })

    expect(res.status).toBe(400)
  })
})

// ---------------------------------------------------------------------------
// POST /v1/auth/logout
// ---------------------------------------------------------------------------
describe('POST /v1/auth/logout', () => {
  test('returns { success: true } and invalidates the token', async () => {
    const user = await insertUser()
    const token = await createSession(user.user_id)

    const logoutRes = await app.request('/v1/auth/logout', {
      method: 'POST',
      headers: authHeader(token),
    })
    expect(logoutRes.status).toBe(200)
    expect((await logoutRes.json() as any).success).toBe(true)

    // Token should no longer work
    const followUp = await app.request(`/v1/users/${user.user_id}`, {
      headers: authHeader(token),
    })
    expect(followUp.status).toBe(401)
  })

  test('returns 401 without a token', async () => {
    const res = await app.request('/v1/auth/logout', { method: 'POST' })
    expect(res.status).toBe(401)
  })
})
