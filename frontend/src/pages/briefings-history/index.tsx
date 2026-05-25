import { useNavigate } from '@tanstack/react-router'
import { useBriefings } from '@/hooks/useBriefings'
import { Container } from '@/components/ui/container'
import { Heading } from '@/components/ui/heading'
import { Label } from '@/components/ui/label'
import { BackButton } from '@/components/ui/back-button'
import { Divider } from '@/components/ui/divider'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { ListItem } from '@/components/ui/list-item'
import { formatBriefingDate } from '@/lib/dateFormat'
import styles from './briefings-history.module.css'

export function BriefingsHistoryPage() {
  const navigate = useNavigate()
  const { data: briefings, isLoading } = useBriefings()

  return (
    <Container className={styles.page}>

      <BackButton onClick={() => navigate({ to: '/dashboard' })} />

      <div className={styles.header}>
        <Label>history</Label>
        <Heading as="h1">all briefings.</Heading>
      </div>

      <Divider />

      {isLoading ? (
        <div className={styles.list}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} height="52px" />
          ))}
        </div>
      ) : !briefings?.length ? (
        <EmptyState
          title="no briefings yet"
          description="your briefings will appear here once they're generated."
        />
      ) : (
        <div className={styles.list}>
          {briefings.map(b => (
            <ListItem
              key={b.briefing_id}
              onClick={() => navigate({ to: '/briefings/$briefingId', params: { briefingId: b.briefing_id } })}
            >
              <div className={styles.item}>
                <span className={styles.itemDate}>{formatBriefingDate(b.created_at)}</span>
                <span className={styles.itemTitle}>{b.subject ?? b.short_summary}</span>
              </div>
            </ListItem>
          ))}
        </div>
      )}

    </Container>
  )
}
