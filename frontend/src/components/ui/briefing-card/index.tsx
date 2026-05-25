import { TickerPill } from '../ticker-pill'
import styles from './briefing-card.module.css'

interface BriefingCardProps {
  date: string
  shortSummary: string
  tickers?: string[]
  onClick?: () => void
  className?: string
}

export function BriefingCard({ date, shortSummary, tickers = [], onClick, className = '' }: BriefingCardProps) {
  return (
    <div className={`${styles.card} ${className}`} onClick={onClick} role={onClick ? 'button' : undefined}>
      <div className={styles.header}>
        <span className={styles.date}>{date}</span>
        {tickers.length > 0 && (
          <div className={styles.tickers}>
            {tickers.map(t => <TickerPill key={t} symbol={t} />)}
          </div>
        )}
      </div>
      <div className={`${styles.body} selectable`}>
        <p className={styles.summary}>{shortSummary}</p>
      </div>
    </div>
  )
}
