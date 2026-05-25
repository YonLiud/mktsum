import type { InputHTMLAttributes } from 'react'
import styles from './input.module.css'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
  mono?: boolean
}

export function Input({ error = false, mono = false, className = '', ...props }: InputProps) {
  return (
    <input
      className={`${styles.input} ${error ? styles.error : ''} ${mono ? styles.mono : ''} ${className}`}
      {...props}
    />
  )
}
