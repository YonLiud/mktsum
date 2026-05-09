import type { ReactNode } from 'react'
import { showcase as button }        from './button/showcase'
import { showcase as card }          from './card/showcase'
import { showcase as input }         from './input/showcase'
import { showcase as formField }     from './form-field/showcase'
import { showcase as tickerPill }    from './ticker-pill/showcase'
import { showcase as container }     from './container/showcase'
import { showcase as heading }       from './heading/showcase'
import { showcase as text }          from './text/showcase'
import { showcase as avatar }        from './avatar/showcase'
import { showcase as badge }         from './badge/showcase'
import { showcase as spinner }       from './spinner/showcase'
import { showcase as emptyState }    from './empty-state/showcase'
import { showcase as searchInput }   from './search-input/showcase'
import { showcase as briefingCard }  from './briefing-card/showcase'
import { showcase as watchlistItem } from './watchlist-item/showcase'
import { showcase as divider }       from './divider/showcase'

export const componentRegistry: Record<string, ReactNode> = {
  button,
  card,
  input,
  'form-field':     formField,
  'ticker-pill':    tickerPill,
  container,
  heading,
  text,
  avatar,
  badge,
  spinner,
  'empty-state':    emptyState,
  'search-input':   searchInput,
  'briefing-card':  briefingCard,
  'watchlist-item': watchlistItem,
  divider,
}
