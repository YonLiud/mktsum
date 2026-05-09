import { Badge } from '.'

export const showcase = (
  <div className="flex flex-col gap-6">
    <section className="flex flex-col gap-3">
      <p className="text-xs opacity-40 uppercase tracking-widest">variants</p>
      <div className="flex items-center gap-3">
        <Badge variant="positive">+2.4%</Badge>
        <Badge variant="negative">-1.8%</Badge>
        <Badge variant="neutral">neutral</Badge>
      </div>
    </section>
    <section className="flex flex-col gap-3">
      <p className="text-xs opacity-40 uppercase tracking-widest">in context</p>
      <div className="flex items-center gap-3">
        <Badge variant="positive">market open</Badge>
        <Badge variant="negative">market closed</Badge>
        <Badge variant="neutral">pending</Badge>
      </div>
    </section>
  </div>
)
