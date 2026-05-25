import styles from './avatar.module.css'

type Size = 'sm' | 'md' | 'lg'

interface AvatarProps {
  name: string
  size?: Size
  className?: string
}

function initials(name: string) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

export function Avatar({ name, size = 'md', className = '' }: AvatarProps) {
  return (
    <span className={`${styles.avatar} ${styles[size]} ${className}`}>
      {initials(name)}
    </span>
  )
}
