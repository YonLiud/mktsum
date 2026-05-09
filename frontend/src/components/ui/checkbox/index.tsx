import type { ReactNode } from 'react'
import styles from './checkbox.module.css'

interface CheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  children?: ReactNode
}

export function Checkbox({ checked, onChange, children }: CheckboxProps) {
  return (
    <label className={styles.wrapper}>
      <input
        type="checkbox"
        className={styles.input}
        checked={checked}
        onChange={e => onChange(e.target.checked)}
      />
      <span className={`${styles.box} ${checked ? styles.checked : ''}`}>
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      {children && <span className={styles.label}>{children}</span>}
    </label>
  )
}
