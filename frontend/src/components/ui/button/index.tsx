import type { ButtonHTMLAttributes } from 'react'
import styles from './button.module.css'

type Variant = 'primary' | 'ghost' | 'danger'
type Size = 'sm' | 'md'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

export function Button({ variant = 'primary', size = 'md', className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`${styles.base} ${styles[variant]} ${styles[size]} ${className}`}
      {...props}
    />
  )
}
