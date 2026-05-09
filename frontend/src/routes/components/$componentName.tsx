import { createFileRoute } from '@tanstack/react-router'
import { componentRegistry } from '@/components/ui/registry'

export const Route = createFileRoute('/components/$componentName')({
  component: ComponentShowcasePage,
})

function ComponentShowcasePage() {
  const { componentName } = Route.useParams()
  const showcase = componentRegistry[componentName]

  if (!showcase) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <p className="text-sm opacity-40">no component named "{componentName}"</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 flex flex-col gap-8">
      <h1 className="text-2xl font-medium">{componentName}.</h1>
      {showcase}
    </div>
  )
}
