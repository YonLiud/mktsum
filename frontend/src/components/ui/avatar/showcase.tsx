import { Avatar } from '.'

export const showcase = (
  <div className="flex flex-col gap-6">
    <section className="flex flex-col gap-3">
      <p className="text-xs opacity-40 uppercase tracking-widest">sizes</p>
      <div className="flex items-center gap-4">
        <Avatar name="Yon Liu" size="sm" />
        <Avatar name="Yon Liu" size="md" />
        <Avatar name="Yon Liu" size="lg" />
      </div>
    </section>
    <section className="flex flex-col gap-3">
      <p className="text-xs opacity-40 uppercase tracking-widest">initials</p>
      <div className="flex items-center gap-4">
        <Avatar name="John" />
        <Avatar name="John Doe" />
        <Avatar name="John Michael Doe" />
      </div>
    </section>
  </div>
)
