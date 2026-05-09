import { BriefingCard } from '.'

export const showcase = (
  <div className="flex flex-col gap-6">
    <section className="flex flex-col gap-3">
      <p className="text-xs opacity-40 uppercase tracking-widest">default</p>
      <BriefingCard
        date="may 9, 2026"
        shortSummary="Markets closed mixed on Friday as tech stocks pulled back following strong jobs data that reduced expectations for near-term rate cuts."
        tickers={['AAPL', 'NVDA', 'SPY']}
      />
    </section>
    <section className="flex flex-col gap-3">
      <p className="text-xs opacity-40 uppercase tracking-widest">no tickers</p>
      <BriefingCard
        date="may 8, 2026"
        shortSummary="Broad market rally driven by better-than-expected earnings from the financial sector."
      />
    </section>
  </div>
)
