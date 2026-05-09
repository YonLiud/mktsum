import { FormField } from '.'
import { Input } from '../input'

export const showcase = (
  <div className="flex flex-col gap-6 max-w-sm">
    <section className="flex flex-col gap-3">
      <p className="text-xs opacity-40 uppercase tracking-widest">default</p>
      <FormField label="Username">
        <Input placeholder="yon" />
      </FormField>
    </section>
    <section className="flex flex-col gap-3">
      <p className="text-xs opacity-40 uppercase tracking-widest">with hint</p>
      <FormField label="ntfy topic" hint="used to send you push notifications">
        <Input placeholder="my-topic" />
      </FormField>
    </section>
    <section className="flex flex-col gap-3">
      <p className="text-xs opacity-40 uppercase tracking-widest">with error</p>
      <FormField label="Password" error="incorrect password">
        <Input placeholder="••••••••" type="password" error />
      </FormField>
    </section>
  </div>
)
