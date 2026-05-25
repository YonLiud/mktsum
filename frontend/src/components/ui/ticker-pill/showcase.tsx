import { TickerPill } from '.'

export const showcase = (
  <div className="flex flex-col gap-6">
    <section className="flex flex-col gap-3">
      <p className="text-xs opacity-40 uppercase tracking-widest">default</p>
      <div className="flex flex-wrap gap-2">
        <TickerPill symbol="AAPL" />
        <TickerPill symbol="TSLA" />
        <TickerPill symbol="NVDA" />
        <TickerPill symbol="MSFT" />
        <TickerPill symbol="SPY" />
      </div>
    </section>
  </div>
)
