import type { HTMLAttributes } from 'react'
import styles from './badge.module.css'

type Variant = 'positive' | 'negative' | 'neutral'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: Variant
}

export function Badge({ variant = 'neutral', className = '', ...props }: BadgeProps) {
  return <span className={`${styles.badge} ${styles[variant]} ${className}`} {...props} />
}
