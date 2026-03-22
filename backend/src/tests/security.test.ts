import 'dotenv/config'
import { describe, it, expect, afterAll } from 'vitest'
import { prisma } from '../lib/prisma.ts'
import express from 'express'
import request from 'supertest'
import { securityHeaders } from '../middleware/security.ts'
import healthRouter from '../routes/internal/health.ts'

const app = express()
app.use(securityHeaders)
app.use(express.json())
app.use(healthRouter)

afterAll(async () => {
  await prisma.$disconnect()
})

describe('Security Headers', () => {
  it('should set X-Frame-Options to DENY (clickjacking protection)', async () => {
    const res = await request(app).get('/')
    expect(res.headers['x-frame-options']).toBe('DENY')
  })

  it('should set X-Content-Type-Options to nosniff (MIME sniffing protection)', async () => {
    const res = await request(app).get('/')
    expect(res.headers['x-content-type-options']).toBe('nosniff')
  })

  it('should set X-XSS-Protection header (XSS protection)', async () => {
    const res = await request(app).get('/')
    expect(res.headers['x-xss-protection']).toBe('1; mode=block')
  })

  it('should set Cache-Control to prevent caching of sensitive data', async () => {
    const res = await request(app).get('/')
    expect(res.headers['cache-control']).toContain('no-store')
    expect(res.headers['cache-control']).toContain('no-cache')
  })

  it('should set Pragma header to prevent caching', async () => {
    const res = await request(app).get('/')
    expect(res.headers['pragma']).toBe('no-cache')
  })

  it('should set Expires header to 0', async () => {
    const res = await request(app).get('/')
    expect(res.headers['expires']).toBe('0')
  })

  it('should set Referrer-Policy to strict-origin-when-cross-origin', async () => {
    const res = await request(app).get('/')
    expect(res.headers['referrer-policy']).toBe('strict-origin-when-cross-origin')
  })

  it('should not break normal requests', async () => {
    const res = await request(app).get('/')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
  })
})
