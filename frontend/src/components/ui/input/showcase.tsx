import { Input } from '.'

export const showcase = (
  <div className="flex flex-col gap-6">
    <section className="flex flex-col gap-3">
      <p className="text-xs opacity-40 uppercase tracking-widest">default</p>
      <Input placeholder="placeholder text" />
    </section>
    <section className="flex flex-col gap-3">
      <p className="text-xs opacity-40 uppercase tracking-widest">focused</p>
      <Input placeholder="focused" autoFocus />
    </section>
    <section className="flex flex-col gap-3">
      <p className="text-xs opacity-40 uppercase tracking-widest">error</p>
      <Input placeholder="something went wrong" error />
    </section>
    <section className="flex flex-col gap-3">
      <p className="text-xs opacity-40 uppercase tracking-widest">disabled</p>
      <Input placeholder="not editable" disabled />
    </section>
    <section className="flex flex-col gap-3">
      <p className="text-xs opacity-40 uppercase tracking-widest">mono — ticker</p>
      <Input placeholder="aapl" mono />
    </section>
  </div>
)
