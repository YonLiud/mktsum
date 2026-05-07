import { createFileRoute } from '@tanstack/react-router'
import { BriefingPage } from '@/pages/BriefingPage'

export const Route = createFileRoute('/briefings/$briefingId')({
  component: BriefingPage,
})
