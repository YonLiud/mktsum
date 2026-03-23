import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import router from './routes'

const app = new Hono()

app.route('/', router)

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json({ error: err.message }, err.status)
  }
  console.error(err)
  return c.json({ error: 'Internal server error' }, 500)
})

app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404)
})

export default {
  port: process.env.PORT ?? 3000,
  fetch: app.fetch,
}