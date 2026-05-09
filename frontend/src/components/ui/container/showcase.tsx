import { Container } from '.'

export const showcase = (
  <div className="flex flex-col gap-6">
    {(['sm', 'md', 'lg'] as const).map((size) => (
      <section key={size} className="flex flex-col gap-2">
        <p className="text-xs opacity-40 uppercase tracking-widest">{size}</p>
        <Container size={size} className="border border-dashed border-current/20 py-4">
          <p className="text-xs opacity-40 text-center">{size} container</p>
        </Container>
      </section>
    ))}
  </div>
)
