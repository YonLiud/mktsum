import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Link } from '@tanstack/react-router'
import ntfyContent from '@/content/ntfy.md?raw'
import styles from '@/pages/legal/legal.module.css'

export function NtfyGuidePage() {
  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <Link to="/dashboard" className={styles.back}>← back to app</Link>
        <article className={styles.markdown}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{ntfyContent}</ReactMarkdown>
        </article>
      </div>
    </div>
  )
}
