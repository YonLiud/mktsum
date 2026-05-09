import { EmptyState } from '.'
import { Button } from '../button'

export const showcase = (
  <div className="flex flex-col gap-6">
    <section className="flex flex-col gap-3">
      <p className="text-xs opacity-40 uppercase tracking-widest">title only</p>
      <EmptyState title="no briefings yet" />
    </section>
    <section className="flex flex-col gap-3">
      <p className="text-xs opacity-40 uppercase tracking-widest">with description</p>
      <EmptyState
        title="your watchlist is empty"
        description="add some tickers to start receiving daily briefings"
      />
    </section>
    <section className="flex flex-col gap-3">
      <p className="text-xs opacity-40 uppercase tracking-widest">with action</p>
      <EmptyState
        title="your watchlist is empty"
        description="add some tickers to start receiving daily briefings"
        action={<Button size="sm">add ticker</Button>}
      />
    </section>
  </div>
)
