import { Heading } from '.'

export const showcase = (
  <div className="flex flex-col gap-4">
    <Heading as="h1">h1 — market briefing</Heading>
    <Heading as="h2">h2 — your watchlist</Heading>
    <Heading as="h3">h3 — recent activity</Heading>
    <Heading as="h4">h4 — section label</Heading>
    <div className="border-t border-current/10 pt-4 flex flex-col gap-4">
      <p className="text-xs opacity-40 uppercase tracking-widest">size override</p>
      <Heading as="h2" size="xl">h2 but xl size</Heading>
      <Heading as="h1" size="sm">h1 but sm size</Heading>
    </div>
  </div>
)
