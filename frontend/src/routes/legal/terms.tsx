import { createFileRoute } from '@tanstack/react-router'
import { LegalTermsPage } from '@/pages/legal'

export const Route = createFileRoute('/legal/terms')({
  head: () => ({ meta: [{ title: 'Terms of Service — mktsum' }] }),
  component: LegalTermsPage,
})
