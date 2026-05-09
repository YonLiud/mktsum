import { Hono } from 'hono'
import { cors } from 'hono/cors'
import router from './routes'

const app = new Hono()

const allowedOrigins = (Bun.env.FRONTEND_URL ?? 'http://localhost:5173').split(',').map(s => s.trim())

app.use(cors({
  origin: (origin) => allowedOrigins.includes(origin) ? origin : null,
  credentials: true,
}))
app.route('/', router)

export default app
