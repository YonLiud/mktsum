import { Skeleton } from '.'
import { Text } from '../text'

export const showcase = (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
    <Text variant="secondary">default</Text>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <Skeleton height="14px" />
      <Skeleton height="14px" />
      <Skeleton height="14px" width="60%" />
    </div>
    <Text variant="secondary">dark (for card headers)</Text>
    <div style={{ background: 'var(--bg-card-header)', padding: '16px', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <Skeleton variant="dark" height="10px" width="80px" />
      <Skeleton variant="dark" height="18px" />
      <Skeleton variant="dark" height="18px" width="70%" />
    </div>
  </div>
)
