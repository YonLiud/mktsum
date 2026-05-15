import styles from './back-button.module.css'

interface BackButtonProps {
  onClick: () => void
}

export function BackButton({ onClick }: BackButtonProps) {
  return (
    <button className={styles.back} onClick={onClick}>
      ← back
    </button>
  )
}
