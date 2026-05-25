import { Spinner } from '.'

export const showcase = (
  <div className="flex flex-col gap-6">
    <section className="flex flex-col gap-3">
      <p className="text-xs opacity-40 uppercase tracking-widest">sizes</p>
      <div className="flex items-center gap-6">
        <Spinner size="sm" />
        <Spinner size="md" />
        <Spinner size="lg" />
      </div>
    </section>
  </div>
)
