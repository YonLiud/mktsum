import { createFileRoute } from '@tanstack/react-router'
import { LegalPrivacyPage } from '@/pages/legal'

export const Route = createFileRoute('/legal/privacy')({
  component: LegalPrivacyPage,
})
