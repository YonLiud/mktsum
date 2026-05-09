import styles from './skeleton.module.css'

interface SkeletonProps {
  height?: string
  width?: string
  className?: string
  variant?: 'default' | 'dark'
}

export function Skeleton({ height = '14px', width, variant = 'default', className = '' }: SkeletonProps) {
  return (
    <div
      className={`${styles.skeleton} ${variant === 'dark' ? styles.dark : ''} ${className}`}
      style={{ height, width }}
    />
  )
}
