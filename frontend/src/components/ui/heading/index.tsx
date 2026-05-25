import type { HTMLAttributes } from 'react'
import styles from './heading.module.css'

type Level = 'h1' | 'h2' | 'h3' | 'h4'
type Size = 'xl' | 'lg' | 'md' | 'sm'

const defaultSize: Record<Level, Size> = {
  h1: 'xl',
  h2: 'lg',
  h3: 'md',
  h4: 'sm',
}

interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: Level
  size?: Size
}

export function Heading({ as: Tag = 'h1', size, className = '', ...props }: HeadingProps) {
  const resolvedSize = size ?? defaultSize[Tag]
  return <Tag className={`${styles.heading} ${styles[resolvedSize]} ${className}`} {...props} />
}
