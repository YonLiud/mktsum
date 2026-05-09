import type { HTMLAttributes } from 'react'
import styles from './container.module.css'

type Size = 'sm' | 'md' | 'lg'

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: Size
}

export function Container({ size = 'md', className = '', ...props }: ContainerProps) {
  return <div className={`${styles.container} ${styles[size]} ${className}`} {...props} />
}
