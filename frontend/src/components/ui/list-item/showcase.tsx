import { ListItem } from '.'
import { TickerPill } from '../ticker-pill'

export const showcase = (
  <div className="flex flex-col gap-6 max-w-sm">
    <section className="flex flex-col gap-3">
      <p className="text-xs opacity-40 uppercase tracking-widest">ticker list</p>
      <div>
        <ListItem onClick={() => {}} onRemove={() => {}} removeLabel="remove AAPL">
          <TickerPill symbol="AAPL" />
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Apple Inc.</span>
        </ListItem>
        <ListItem onClick={() => {}} onRemove={() => {}} removeLabel="remove NVDA">
          <TickerPill symbol="NVDA" />
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>NVIDIA Corporation</span>
        </ListItem>
        <ListItem onClick={() => {}} onRemove={() => {}} removeLabel="remove SPY">
          <TickerPill symbol="SPY" />
        </ListItem>
      </div>
    </section>
    <section className="flex flex-col gap-3">
      <p className="text-xs opacity-40 uppercase tracking-widest">briefing list</p>
      <div>
        <ListItem onClick={() => {}}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>may 10 briefing</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Tech stocks rally as Fed signals pause</span>
          </div>
        </ListItem>
        <ListItem onClick={() => {}}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>may 9 briefing</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>NVDA earnings beat expectations, up 8%</span>
          </div>
        </ListItem>
      </div>
    </section>
  </div>
)
