import { getUsers, getTickers, getAllTickerRecords, refreshAllTickers, postBriefingsBulk } from './fetcher'
import { fetchNews } from './rss'
import { summarizeTickers, generateNewsletter, generateMeta } from './llm'
import type { TickerWithNews } from './types'

async function run() {
  console.log('[engine] starting run')

  // 1. Refresh ticker prices in the backend DB, then fetch updated records + users
  console.log('[engine] refreshing tickers')
  await refreshAllTickers()

  const [users, tickerSymbols, tickerRecords] = await Promise.all([
    getUsers(),
    getTickers(),
    getAllTickerRecords(),
  ])
  console.log(`[engine] ${users.length} users, ${tickerSymbols.length} unique tickers`)

  if (tickerSymbols.length === 0) {
    console.log('[engine] no tickers — nothing to do')
    return
  }

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

  // 5. Stage 2 + 3: per-user newsletter + meta, then collect briefings
  const briefings: Parameters<typeof postBriefingsBulk>[0] = []

  for (const user of users) {
    const userTickers = user.watchlist.map(w => w.ticker)
    if (userTickers.length === 0) continue

    console.log(`[engine] generating briefing for ${user.username}`)

    // Stage 2: full newsletter (Sonnet)
    const newsletter = await generateNewsletter(user, summaryMap)

    // Stage 3: subject + short_summary (Haiku)
    const meta = await generateMeta(newsletter)

    // Collect sources from the user's tickers
    const sources = userTickers.flatMap(symbol =>
      (tickersWithNews.find(t => t.symbol === symbol)?.news ?? []).map(n => ({
        ticker: n.ticker,
        title: n.title,
        url: n.url,
      }))
    )

    briefings.push({
      user_id: user.user_id,
      subject: meta.subject,
      full_summary: newsletter,
      short_summary: meta.short_summary,
      sources,
    })
  }

  // 6. Post all briefings to the backend
  if (briefings.length > 0) {
    console.log(`[engine] posting ${briefings.length} briefings`)
    await postBriefingsBulk(briefings)
  }

  console.log('[engine] done')
}

run().catch(err => {
  console.error('[engine] fatal:', err)
  process.exit(1)
})
