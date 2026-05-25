import { createFileRoute } from '@tanstack/react-router'
import { LegalPrivacyPage } from '@/pages/legal'

export const Route = createFileRoute('/legal/privacy')({
  head: () => ({ meta: [{ title: 'Privacy Policy — mktsum' }] }),
  component: LegalPrivacyPage,
})
