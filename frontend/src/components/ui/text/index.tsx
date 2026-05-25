import type { HTMLAttributes } from 'react'
import styles from './text.module.css'

type Variant = 'primary' | 'secondary' | 'muted' | 'accent'
type Size = 'sm' | 'md' | 'lg'

interface TextProps extends HTMLAttributes<HTMLParagraphElement> {
  variant?: Variant
  size?: Size
  as?: 'p' | 'span' | 'div'
}

export function Text({ variant = 'primary', size = 'md', as: Tag = 'p', className = '', ...props }: TextProps) {
  return <Tag className={`${styles.text} ${styles[variant]} ${styles[size]} ${className}`} {...props} />
}
