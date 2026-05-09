import { createFileRoute } from '@tanstack/react-router'
import { LegalTermsPage } from '@/pages/legal'

export const Route = createFileRoute('/legal/terms')({
  component: LegalTermsPage,
})
