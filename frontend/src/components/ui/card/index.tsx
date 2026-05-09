import type { HTMLAttributes } from 'react'
import styles from './card.module.css'

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  accent?: boolean
}

export function Card({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`${styles.card} ${className}`} {...props} />
}

export function CardHeader({ accent = false, className = '', ...props }: CardHeaderProps) {
  const cls = accent ? styles['header-accent'] : styles.header
  return <div className={`${cls} ${className}`} {...props} />
}

export function CardBody({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`${styles.body} ${className}`} {...props} />
}
