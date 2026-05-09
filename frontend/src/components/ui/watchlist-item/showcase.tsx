import { WatchlistItem } from '.'

export const showcase = (
  <div className="flex flex-col gap-6 max-w-sm">
    <section className="flex flex-col gap-3">
      <p className="text-xs opacity-40 uppercase tracking-widest">list</p>
      <div>
        <WatchlistItem symbol="AAPL" name="Apple Inc." onRemove={() => {}} />
        <WatchlistItem symbol="NVDA" name="NVIDIA Corporation" onRemove={() => {}} />
        <WatchlistItem symbol="SPY" name="SPDR S&P 500 ETF" onRemove={() => {}} />
        <WatchlistItem symbol="TSLA" name="Tesla, Inc." onRemove={() => {}} />
      </div>
    </section>
    <section className="flex flex-col gap-3">
      <p className="text-xs opacity-40 uppercase tracking-widest">no name / no remove</p>
      <div>
        <WatchlistItem symbol="AAPL" />
        <WatchlistItem symbol="NVDA" />
      </div>
    </section>
  </div>
)
