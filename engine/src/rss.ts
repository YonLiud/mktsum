const NEWS_PER_TICKER = parseInt(process.env.NEWS_PER_TICKER ?? '10')

import type { NewsItem } from './types'

function extractTags(xml: string, tag: string): string[] {
  const results: string[] = []
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'g')
  let match
  while ((match = re.exec(xml)) !== null) {
    results.push(match[1]!.trim().replace(/^<!\[CDATA\[|\]\]>$/g, ''))
  }
  return results
}

export async function fetchNews(ticker: string): Promise<NewsItem[]> {
  const url = `https://news.google.com/rss/search?q=${ticker}+stock&hl=en-US&gl=US&ceid=US:en`
  const res = await fetch(url, { headers: { 'User-Agent': 'mktsum/1.0' } })
  if (!res.ok) return []

  const xml = await res.text()

  // Slice out <channel> title so we only get <item> titles
  const itemsXml = xml.slice(xml.indexOf('<item>'))

  const titles = extractTags(itemsXml, 'title')
  const links = extractTags(itemsXml, 'link')

  return titles.slice(0, NEWS_PER_TICKER).map((title, i) => ({
    ticker,
    title,
    url: links[i] ?? '',
  }))
}
