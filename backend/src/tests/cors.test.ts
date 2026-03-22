import 'dotenv/config'
import { describe, it, expect, afterAll } from 'vitest'
import { prisma } from '../lib/prisma.ts'
import express from 'express'
import request from 'supertest'
import { corsMiddleware } from '../middleware/cors.ts'
import healthRouter from '../routes/internal/health.ts'

const app = express()
app.use(corsMiddleware)
app.use(express.json())
app.use(healthRouter)

afterAll(async () => {
  await prisma.$disconnect()
})

describe('CORS Middleware', () => {
  it('should add Access-Control-Allow-Origin header', async () => {
    const res = await request(app).get('/')
    expect(res.headers['access-control-allow-origin']).toBe('*')
  })

  it('should add Access-Control-Allow-Methods header', async () => {
    const res = await request(app).get('/')
    expect(res.headers['access-control-allow-methods']).toBe('GET, POST, PATCH, DELETE, OPTIONS')
  })

  it('should add Access-Control-Allow-Headers header', async () => {
    const res = await request(app).get('/')
    expect(res.headers['access-control-allow-headers']).toBe('Content-Type, Authorization')
  })

  it('should handle OPTIONS preflight requests', async () => {
    const res = await request(app).options('/')
    expect(res.status).toBe(200)
    expect(res.headers['access-control-allow-origin']).toBe('*')
    expect(res.headers['access-control-allow-methods']).toBe('GET, POST, PATCH, DELETE, OPTIONS')
  })

  it('should not block GET requests', async () => {
    const res = await request(app).get('/')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
  })
})
