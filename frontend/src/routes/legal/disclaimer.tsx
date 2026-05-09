import { createFileRoute } from '@tanstack/react-router'
import { LegalDisclaimerPage } from '@/pages/legal'

export const Route = createFileRoute('/legal/disclaimer')({
  component: LegalDisclaimerPage,
})
