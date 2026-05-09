import styles from './ticker-pill.module.css'

interface TickerPillProps {
  symbol: string
}

export function TickerPill({ symbol }: TickerPillProps) {
  return <span className={styles.pill}>{symbol.toUpperCase()}</span>
}
