import { getUsers, refreshWatchedTickers, postBriefing, triggerNotifier } from './fetcher'
import { fetchNews } from './rss'
import { summarizeTickers, generateNewsletter, generateMeta } from './llm'
import type { TickerWithNews } from './types'

async function run() {
  console.log('[engine] starting run')

  // 1. Get users, derive the set of watched tickers, refresh only those
  const users = await getUsers()
  const tickerSymbols = [...new Set(users.flatMap(u => u.watchlist.map(w => w.ticker)))]
  console.log(`[engine] ${users.length} users, ${tickerSymbols.length} unique tickers`)

  if (tickerSymbols.length === 0) {
    console.log('[engine] no tickers — nothing to do')
    return
  }

  console.log('[engine] refreshing watched tickers')
  const tickerRecords = await refreshWatchedTickers(tickerSymbols)
  const priceMap = new Map(tickerRecords.map(t => [t.symbol, t]))

  // 2. Fetch news for all tickers in parallel
  console.log('[engine] fetching news')
  const newsResults = await Promise.all(tickerSymbols.map(symbol => fetchNews(symbol)))

  const tickersWithNews: TickerWithNews[] = tickerSymbols.map((symbol, i) => {
    const record = priceMap.get(symbol)
    return {
      symbol,
      price: record?.price ?? null,
      change_pct: record?.change_pct ?? null,
      news: newsResults[i] ?? [],
    }
  })

  // 4. Stage 1: summarize each ticker's news (Haiku)
  console.log('[engine] stage 1: summarizing tickers')
  const summaryMap = await summarizeTickers(tickersWithNews)

  // 5. Stage 2 + 3: per-user newsletter + meta, post, and notify — all in parallel
  await Promise.all(
    users
      .filter(user => user.watchlist.length > 0)
      .map(async user => {
        const userTickers = user.watchlist.map(w => w.ticker)

        console.log(`[engine] generating briefing for ${user.username}`)

        try {
          const newsletter = await generateNewsletter(user, summaryMap)
          const meta = await generateMeta(newsletter)

          const sources = userTickers.flatMap(symbol =>
            (tickersWithNews.find(t => t.symbol === symbol)?.news ?? []).map(n => ({
              ticker: n.ticker,
              title: n.title,
              url: n.url,
            }))
          )

          const { briefing_id } = await postBriefing({
            user_id: user.user_id,
            subject: meta.subject,
            full_summary: newsletter,
            short_summary: meta.short_summary,
            sources,
          })

          console.log(`[engine] posted briefing for ${user.username}, triggering notifier`)
          await triggerNotifier(briefing_id)
        } catch (err) {
          console.error(`[engine] failed briefing for ${user.username}:`, err)
        }
      })
  )

  console.log('[engine] done')
}

async function notifyFailure(err: unknown) {
  const topic = process.env.FAILURE_NTFY_TOPIC
  if (!topic) return
  const message = err instanceof Error ? err.message : String(err)
  await fetch(`https://ntfy.sh/${topic}`, {
    method: 'POST',
    body: `Engine run failed: ${message}`,
    headers: { Title: 'mktsum engine error', Priority: 'high' },
  }).catch(() => {})
}

run().catch(async err => {
  console.error('[engine] fatal:', err)
  await notifyFailure(err)
  process.exit(1)
})
