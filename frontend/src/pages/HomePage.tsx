import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function HomePage() {
  const [dark, setDark] = useState(false)

  function toggleTheme() {
    setDark(d => {
      document.documentElement.classList.toggle('dark', !d)
      return !d
    })
  }

  return (
    <div className="min-h-screen bg-base text-foreground px-4 py-12 max-w-lg mx-auto flex flex-col gap-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">mktsum.</h1>
          <p className="text-muted text-sm mt-1">component library</p>
        </div>
        <Button variant="ghost" size="sm" onClick={toggleTheme}>
          {dark ? 'light' : 'dark'}
        </Button>
      </div>

      <section className="flex flex-col gap-4">
        <p className="section-label">button</p>

        <div className="flex flex-col gap-3">
          <p className="text-subtle text-xs">variants</p>
          <div className="flex flex-wrap gap-2">
            <Button variant="primary">primary</Button>
            <Button variant="ghost">ghost</Button>
            <Button variant="danger">danger</Button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-subtle text-xs">sizes</p>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="md">medium</Button>
            <Button size="sm">small</Button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-subtle text-xs">disabled</p>
          <div className="flex flex-wrap gap-2">
            <Button disabled>primary</Button>
            <Button variant="ghost" disabled>ghost</Button>
            <Button variant="danger" disabled>danger</Button>
          </div>
        </div>
      </section>
    </div>
  )
}
