import { Text } from '.'

export const showcase = (
  <div className="flex flex-col gap-4">
    <Text variant="primary">primary — main content text</Text>
    <Text variant="secondary">secondary — supporting info</Text>
    <Text variant="muted">muted — timestamps, metadata</Text>
    <Text variant="accent">accent — links, highlights</Text>
    <div className="border-t border-current/10 pt-4 flex flex-col gap-4">
      <p className="text-xs opacity-40 uppercase tracking-widest">sizes</p>
      <Text size="lg">large text</Text>
      <Text size="md">medium text</Text>
      <Text size="sm">small text</Text>
    </div>
  </div>
)
