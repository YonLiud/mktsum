import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Link } from '@tanstack/react-router'
import termsContent from '@/content/legal/terms.md?raw'
import privacyContent from '@/content/legal/privacy.md?raw'
import disclaimerContent from '@/content/legal/disclaimer.md?raw'
import styles from './legal.module.css'

function LegalPage({ content }: { content: string }) {
  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <Link to="/legal" className={styles.back}>← legal</Link>
        <article className={styles.markdown}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </article>
      </div>
    </div>
  )
}

export function LegalIndexPage() {
  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <Link to="/dashboard" className={styles.back}>← back to app</Link>
        <h1 className={styles.heading}>Legal.</h1>
        <p className={styles.subheading}>policies and terms for mktsum</p>
        <nav className={styles.list}>
          <Link to="/legal/terms" className={styles.listItem}>
            <div>
              <p className={styles.listTitle}>Terms of Service</p>
              <p className={styles.listDesc}>Your agreement with mktsum.</p>
            </div>
            <span className={styles.listArrow}>→</span>
          </Link>
          <Link to="/legal/privacy" className={styles.listItem}>
            <div>
              <p className={styles.listTitle}>Privacy Policy</p>
              <p className={styles.listDesc}>How we handle your data.</p>
            </div>
            <span className={styles.listArrow}>→</span>
          </Link>
          <Link to="/legal/disclaimer" className={styles.listItem}>
            <div>
              <p className={styles.listTitle}>Financial Disclaimer</p>
              <p className={styles.listDesc}>AI content and financial limitations.</p>
            </div>
            <span className={styles.listArrow}>→</span>
          </Link>
        </nav>
      </div>
    </div>
  )
}

export function LegalTermsPage() {
  return <LegalPage content={termsContent} />
}

export function LegalPrivacyPage() {
  return <LegalPage content={privacyContent} />
}

export function LegalDisclaimerPage() {
  return <LegalPage content={disclaimerContent} />
}
