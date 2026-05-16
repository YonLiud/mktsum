import { createFileRoute, redirect } from '@tanstack/react-router'
import { HomePage } from '@/pages/home'

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'mktsum' },
      { name: 'description', content: 'AI-powered market briefings, delivered daily to your watchlist.' },
      { property: 'og:title', content: 'mktsum' },
      { property: 'og:description', content: 'AI-powered market briefings, delivered daily to your watchlist.' },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: 'https://mktsum.yxnliu.net' },
      { property: 'og:image', content: 'https://mktsum.yxnliu.net/og.png' },
      { property: 'og:site_name', content: 'mktsum' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'mktsum' },
      { name: 'twitter:description', content: 'AI-powered market briefings, delivered daily to your watchlist.' },
      { name: 'twitter:image', content: 'https://mktsum.yxnliu.net/og.png' },
    ],
  }),
  beforeLoad: () => {
    const stored = localStorage.getItem('auth_user')
    if (stored) throw redirect({ to: '/dashboard' })
  },
  component: HomePage,
})
