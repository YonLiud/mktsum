import { Hono } from 'hono'
import { cors } from 'hono/cors'
import router from './routes'

const app = new Hono()

app.use(cors())
app.route('/', router)

export default app
