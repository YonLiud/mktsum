import { createFileRoute, Link } from '@tanstack/react-router'
import { componentRegistry } from '@/components/ui/registry'

export const Route = createFileRoute('/components/')({
  component: ComponentsIndexPage,
})

function ComponentsIndexPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12 flex flex-col gap-4">
      <h1 className="text-2xl font-medium">components</h1>
      <ul className="flex flex-col gap-2">
        {Object.keys(componentRegistry).map((name) => (
          <li key={name}>
            <Link
              to="/components/$componentName"
              params={{ componentName: name }}
              className="text-sm opacity-60 hover:opacity-100 transition-opacity"
            >
              {name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
