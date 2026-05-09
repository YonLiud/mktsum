import { Button } from '.'

export const showcase = (
  <div className="flex flex-col gap-6">
    <section className="flex flex-col gap-3">
      <p className="text-xs opacity-40 uppercase tracking-widest">variants</p>
      <div className="flex items-center gap-3">
        <Button variant="primary">primary</Button>
        <Button variant="secondary">secondary</Button>
        <Button variant="ghost">ghost</Button>
        <Button variant="success">success</Button>
        <Button variant="danger">danger</Button>
      </div>
    </section>
    <section className="flex flex-col gap-3">
      <p className="text-xs opacity-40 uppercase tracking-widest">sizes</p>
      <div className="flex items-center gap-3">
        <Button size="lg">large</Button>
        <Button size="md">medium</Button>
        <Button size="sm">small</Button>
      </div>
    </section>
    <section className="flex flex-col gap-3">
      <p className="text-xs opacity-40 uppercase tracking-widest">disabled</p>
      <div className="flex items-center gap-3">
        <Button disabled>primary</Button>
        <Button variant="ghost" disabled>ghost</Button>
      </div>
    </section>
    <section className="flex flex-col gap-3">
      <p className="text-xs opacity-40 uppercase tracking-widest">loading</p>
      <div className="flex items-center gap-3">
        <Button loading>primary</Button>
        <Button variant="ghost" loading>ghost</Button>
        <Button variant="danger" loading>danger</Button>
      </div>
    </section>
  </div>
)
