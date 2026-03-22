import 'dotenv/config'
import express from 'express'
import { loadRoutes } from './utils/loadRoutes.ts'
import { errorHandler } from './middleware/errorHandler.ts'
import { corsMiddleware } from './middleware/cors.ts'
import { prisma } from './lib/prisma.ts'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5000

app.use(corsMiddleware)
app.use(express.json({ limit: '10mb' }))

async function start() {
  try {
    await loadRoutes(app, join(__dirname, 'routes'))

    app.use((_req, res) => {
      res.status(404).json({ error: 'Route not found' })
    })

    app.use(errorHandler)

    const server = app.listen(PORT, () => {
      console.log(`server running on port ${PORT}`)
    })

    // Graceful shutdown handler
    const gracefulShutdown = async (signal: string) => {
      console.log(`\nReceived ${signal}, starting graceful shutdown...`)

      server.close(async () => {
        try {
          await prisma.$disconnect()
          console.log('Database connection closed')
          process.exit(0)
        } catch (error) {
          console.error('Error during shutdown:', error)
          process.exit(1)
        }
      })

      // Force shutdown after 30 seconds
      setTimeout(() => {
        console.error('Graceful shutdown timeout, force exiting...')
        process.exit(1)
      }, 30000)
    }

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
    process.on('SIGINT', () => gracefulShutdown('SIGINT'))
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

start().catch((error) => {
  console.error('Unhandled error:', error)
  process.exit(1)
})