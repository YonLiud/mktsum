const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:5000'
const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:4173'
const NTFY_BASE = 'https://ntfy.sh'
const PORT = parseInt(process.env.PORT ?? '3001')

type Briefing = {
  briefing_id: string
  user_id: string
  subject: string | null
  short_summary: string
}

type User = {
  user_id: string
  ntfy_topic: string | null
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BACKEND_URL}${path}`)
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`)
  return res.json() as Promise<T>
}

async function notify(briefing: Briefing) {
  const users = await get<User[]>('/internal/users')
  const user = users.find(u => u.user_id === briefing.user_id)

  if (user?.ntfy_topic) {
    await fetch(`${NTFY_BASE}/${user.ntfy_topic}`, {
      method: 'POST',
      headers: {
        Title: 'mktsum',
        Tags: 'newspaper',
        Click: `${FRONTEND_URL}/briefings/${briefing.briefing_id}`,
      },
      body: briefing.subject ?? 'Your daily market briefing',
    })
    console.log(`[notifier] notified ${briefing.user_id}`)
  } else {
    console.log(`[notifier] no ntfy_topic for ${briefing.user_id}, skipping`)
  }

  await fetch(`${BACKEND_URL}/internal/briefings/${briefing.briefing_id}/sent`, {
    method: 'PATCH',
  })
}

async function run(briefingId?: string) {
  console.log('[notifier] starting run')

  const all = await get<Briefing[]>('/internal/briefings/pending')
  const briefings = briefingId ? all.filter(b => b.briefing_id === briefingId) : all

  if (briefings.length === 0) {
    console.log('[notifier] no pending briefings')
    return
  }

  console.log(`[notifier] ${briefings.length} pending briefings`)

  for (const briefing of briefings) {
    await notify(briefing)
  }

  console.log('[notifier] done')
}

Bun.serve({
  port: PORT,
  async fetch(req) {
    if (req.method === 'POST' && new URL(req.url).pathname === '/trigger') {
      const body = await req.json().catch(() => ({})) as { briefing_id?: string }
      run(body.briefing_id).catch(err => console.error('[notifier] run failed:', err))
      return new Response('ok')
    }
    return new Response('not found', { status: 404 })
  },
})

console.log(`[notifier] listening on :${PORT}`)
