import styles from './spinner.module.css'

type Size = 'sm' | 'md' | 'lg'

interface SpinnerProps {
  size?: Size
  className?: string
}

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  return <span className={`${styles.spinner} ${styles[size]} ${className}`} />
}
