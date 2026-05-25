import { SearchInput } from '.'

export const showcase = (
  <div className="flex flex-col gap-6 max-w-sm">
    <section className="flex flex-col gap-3">
      <p className="text-xs opacity-40 uppercase tracking-widest">default</p>
      <SearchInput placeholder="search tickers..." />
    </section>
    <section className="flex flex-col gap-3">
      <p className="text-xs opacity-40 uppercase tracking-widest">focused</p>
      <SearchInput placeholder="AAPL" autoFocus />
    </section>
  </div>
)
