import Anthropic from '@anthropic-ai/sdk'
import type { TickerWithNews, User } from './types'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function priceOnlySummary(t: TickerWithNews): string {
  if (t.price == null) return `No news or price data available for ${t.symbol}.`
  const direction = t.change_pct == null ? '' : t.change_pct >= 0 ? 'rose' : 'dropped'
  const changePart =
    t.change_pct != null
      ? ` (${t.change_pct >= 0 ? '+' : ''}${(t.change_pct * 100).toFixed(2)}%)`
      : ''
  return `No news found for ${t.symbol}. Price ${direction} to $${t.price.toFixed(2)}${changePart}.`
}

async function summarizeTicker(t: TickerWithNews): Promise<string> {
  if (t.news.length === 0) return priceOnlySummary(t)

  const price =
    t.price != null
      ? `Price: $${t.price.toFixed(2)}${t.change_pct != null ? ` (${t.change_pct >= 0 ? '+' : ''}${(t.change_pct * 100).toFixed(2)}%)` : ''}`
      : ''
  const headlines = t.news.map((n, i) => `${i + 1}. ${n.title}`).join('\n')

  const res = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 256,
    messages: [
      {
        role: 'user',
        content: `You are a financial analyst. Write a concise 2-3 sentence summary of the key news and market context for ${t.symbol}.

${price}
${headlines}

Reply with only the summary, no preamble.`,
      },
    ],
  })

  const text = res.content[0]?.type === 'text' ? res.content[0].text : ''
  return text.trim()
}

export async function summarizeTickers(
  tickersWithNews: TickerWithNews[]
): Promise<Record<string, string>> {
  const entries = await Promise.all(
    tickersWithNews.map(async t => [t.symbol, await summarizeTicker(t)] as const)
  )
  return Object.fromEntries(entries)
}

export async function generateNewsletter(
  user: User,
  summaryMap: Record<string, string>
): Promise<string> {
  const tickers = user.watchlist.map(w => w.ticker)
  const relevant = tickers
    .filter(t => summaryMap[t])
    .map(t => `### ${t}\n${summaryMap[t]}`)
    .join('\n\n')

  const res = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8192,
    thinking: { type: 'adaptive' },
    messages: [
      {
        role: 'user',
        content: `You are a personal financial newsletter writer. Write a daily market briefing for ${user.name} based on their watchlist.

Ticker summaries:
${relevant}

Write an engaging, well-structured markdown newsletter. Include:
- A brief market overview
- Highlights for each ticker with actionable insights
- A closing takeaway

Be concise, professional, and direct. Use markdown headers and formatting.`,
      },
    ],
  })

  const textBlock = res.content.find(b => b.type === 'text')
  if (!textBlock || textBlock.type !== 'text') throw new Error('Stage 2: no text in response')
  return textBlock.text
}

export async function generateMeta(
  newsletter: string
): Promise<{ subject: string; short_summary: string }> {
  const res = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    messages: [
      {
        role: 'user',
        content: `Given this market briefing newsletter, generate:
1. A concise email subject line (under 60 chars)
2. A 2-sentence TL;DR summary

Return ONLY a JSON object: {"subject": "...", "short_summary": "..."}

Newsletter:
${newsletter}`,
      },
    ],
  })

  const text = res.content[0]?.type === 'text' ? res.content[0].text : ''
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Stage 3: no JSON in response')
  return JSON.parse(jsonMatch[0]) as { subject: string; short_summary: string }
}
