import type { ReactNode } from 'react'
import { showcase as button } from './button/showcase'
import { showcase as card } from './card/showcase'

export const componentRegistry: Record<string, ReactNode> = {
  button,
  card,
}
