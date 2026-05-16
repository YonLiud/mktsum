import { createFileRoute } from '@tanstack/react-router'
import { NtfyGuidePage } from '@/pages/ntfy'

export const Route = createFileRoute('/ntfy')({
  head: () => ({ meta: [{ title: 'Notifications — mktsum' }] }),
  component: NtfyGuidePage,
})
