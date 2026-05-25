import { Hono } from 'hono'
import { briefingService } from '../services/briefings'

const shareRoutes = new Hono()

const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:4173'

function escapeHtml(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

shareRoutes.get('/:id', async (c) => {
  const { id } = c.req.param()
  const spaUrl = `${FRONTEND_URL}/briefings/${id}`

  const briefing = await briefingService.getById(id)

  if (!briefing || !briefing.is_public) {
    return c.redirect(spaUrl)
  }

  const title = escapeHtml(briefing.subject ?? 'Market Briefing')
  const description = escapeHtml(briefing.short_summary)

  return c.html(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title} — mktsum</title>
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${spaUrl}">
  <meta property="og:image" content="${FRONTEND_URL}/og.png">
  <meta property="og:site_name" content="mktsum">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${FRONTEND_URL}/og.png">
  <meta http-equiv="refresh" content="0;url=${spaUrl}">
</head>
<body>
  <script>window.location.replace('${spaUrl}')</script>
</body>
</html>`)
})

export { shareRoutes }
