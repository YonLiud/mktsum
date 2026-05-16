import { createFileRoute } from '@tanstack/react-router'
import { BriefingsHistoryPage } from '@/pages/briefings-history'
import { requireAuth } from '@/lib/routeGuards'

export const Route = createFileRoute('/briefings/all')({
  head: () => ({ meta: [{ title: 'Briefings — mktsum' }] }),
  beforeLoad: requireAuth,
  component: BriefingsHistoryPage,
})
