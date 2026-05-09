import { createFileRoute } from '@tanstack/react-router'
import { LegalIndexPage } from '@/pages/legal'

export const Route = createFileRoute('/legal/')({
  component: LegalIndexPage,
})
