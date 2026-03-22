import 'dotenv/config'
import express from 'express'
import { loadRoutes } from './utils/loadRoutes.ts'
import { errorHandler } from './middleware/errorHandler.ts'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5000

app.use(express.json())

async function start() {
  try {
    await loadRoutes(app, join(__dirname, 'routes'))

    app.use(errorHandler)

    app.listen(PORT, () => {
      console.log(`server running on port ${PORT}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

start().catch((error) => {
  console.error('Unhandled error:', error)
  process.exit(1)
})