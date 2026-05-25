import type { ReactNode } from 'react'
import styles from './list-item.module.css'

interface ListItemProps {
  children: ReactNode
  onClick?: () => void
  onRemove?: () => void
  removeLabel?: string
}

export function ListItem({ children, onClick, onRemove, removeLabel = 'remove' }: ListItemProps) {
  return (
    <div className={styles.item}>
      {onClick ? (
        <button className={styles.leftClickable} onClick={onClick}>
          {children}
        </button>
      ) : (
        <div className={styles.left}>{children}</div>
      )}
      {onClick && (
        <svg className={styles.chevron} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      )}
      {onRemove && (
        <button className={styles.remove} onClick={onRemove} aria-label={removeLabel}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  )
}
