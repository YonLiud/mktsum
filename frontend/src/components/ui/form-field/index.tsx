import type { ReactNode } from 'react'
import styles from './form-field.module.css'

interface FormFieldProps {
  label?: string
  error?: string
  hint?: string
  children: ReactNode
}

export function FormField({ label, error, hint, children }: FormFieldProps) {
  return (
    <div className={styles.field}>
      {label && <label className={styles.label}>{label}</label>}
      {children}
      {error && <p className={styles.error}>{error}</p>}
      {hint && !error && <p className={styles.hint}>{hint}</p>}
    </div>
  )
}
