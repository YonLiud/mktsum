import type { HTMLAttributes } from 'react'
import styles from './label.module.css'

interface LabelProps extends HTMLAttributes<HTMLParagraphElement> {
  as?: 'p' | 'span' | 'div'
}

export function Label({ as: Tag = 'p', className = '', ...props }: LabelProps) {
  return <Tag className={`${styles.label} ${className}`} {...props} />
}
