import { Hono } from 'hono'
import { cors } from 'hono/cors'
import router from './routes'

const app = new Hono()

app.use(cors({
  origin: Bun.env.FRONTEND_URL ?? 'http://localhost:5173',
  credentials: true,
}))
app.route('/', router)

export default app
