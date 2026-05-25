import { Card, CardHeader, CardBody } from '.'

export const showcase = (
  <div className="flex flex-col gap-6">
    <section className="flex flex-col gap-3">
      <p className="text-xs opacity-40 uppercase tracking-widest">default</p>
      <Card>
        <CardBody>simple card with no header</CardBody>
      </Card>
    </section>
    <section className="flex flex-col gap-3">
      <p className="text-xs opacity-40 uppercase tracking-widest">with header</p>
      <Card>
        <CardHeader>header</CardHeader>
        <CardBody>body content goes here</CardBody>
      </Card>
    </section>
    <section className="flex flex-col gap-3">
      <p className="text-xs opacity-40 uppercase tracking-widest">accent header</p>
      <Card>
        <CardHeader accent>briefing — may 9</CardHeader>
        <CardBody>markets were up today across the board...</CardBody>
      </Card>
    </section>
  </div>
)
