import type { ReactNode } from 'react'
import { Button } from './button'

export const componentRegistry: Record<string, ReactNode> = {
  button: (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <p className="text-xs opacity-40 uppercase tracking-widest">variants</p>
        <div className="flex items-center gap-3">
          <Button variant="primary">primary</Button>
          <Button variant="ghost">ghost</Button>
          <Button variant="danger">danger</Button>
        </div>
      </section>
      <section className="flex flex-col gap-3">
        <p className="text-xs opacity-40 uppercase tracking-widest">sizes</p>
        <div className="flex items-center gap-3">
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
    </div>
  ),
}
