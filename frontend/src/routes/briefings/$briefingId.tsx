import { createFileRoute } from '@tanstack/react-router'
import { BriefingPage } from '@/pages/briefing'

export const Route = createFileRoute('/briefings/$briefingId')({
  head: () => ({ meta: [{ title: 'Briefing — mktsum' }] }),
  component: BriefingPage,
})
