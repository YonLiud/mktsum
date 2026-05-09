import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useUpdateUser } from '@/hooks/useUpdateUser'
import { useLogout } from '@/hooks/useLogout'
import { useLogoutAll } from '@/hooks/useLogoutAll'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/ui/form-field'
import { Divider } from '@/components/ui/divider'
import styles from './profile.module.css'

export function ProfilePage() {
  const { data: user } = useAuth()
  const { mutate: updateUser, isPending } = useUpdateUser()
  const logout = useLogout()
  const logoutAll = useLogoutAll()
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState({ name: user?.name ?? '', ntfy_topic: user?.ntfy_topic ?? '' })

  if (!user) return null

  return (
    <div className={styles.page}>

      <div className={styles.header}>
        <Avatar name={user.name} size="lg" />
        <div className={styles.headerText}>
          <p className={styles.name}>{user.name}</p>
          <p className={styles.username}>@{user.username}</p>
        </div>
      </div>

      <Divider />

      {isEditing ? (
        <div className={styles.section}>
          <FormField label="display name">
            <Input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="display name"
            />
          </FormField>
          <FormField label="ntfy topic" hint="your ntfy.sh notification channel">
            <Input
              value={form.ntfy_topic}
              onChange={e => setForm(f => ({ ...f, ntfy_topic: e.target.value }))}
              placeholder="ntfy topic"
            />
          </FormField>
          <div className={styles.actions}>
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
              cancel
            </Button>
            <Button
              size="sm"
              loading={isPending}
              onClick={() => updateUser(form, { onSuccess: () => setIsEditing(false) })}
            >
              save
            </Button>
          </div>
        </div>
      ) : (
        <div className={styles.section}>
          <div className={styles.field}>
            <p className={styles.fieldLabel}>display name</p>
            <p className={styles.fieldValue}>{user.name}</p>
          </div>
          <div className={styles.field}>
            <p className={styles.fieldLabel}>ntfy topic</p>
            {user.ntfy_topic
              ? <p className={styles.fieldValue}>{user.ntfy_topic}</p>
              : <p className={styles.fieldEmpty}>not set</p>
            }
          </div>
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
            edit profile
          </Button>
        </div>
      )}

      <Divider />

      <div className={styles.section}>
        <div className={styles.field}>
          <p className={styles.fieldLabel}>session</p>
          <p className={styles.fieldEmpty}>logged in as @{user.username}</p>
        </div>
        <div className={styles.actions}>
          <Button variant="ghost" size="sm" onClick={logout}>
            log out
          </Button>
          <Button variant="danger" size="sm" onClick={logoutAll}>
            log out all devices
          </Button>
        </div>
        <p className={styles.syncNote}>data syncs every 10s — may take a moment to reflect across sessions.</p>
      </div>

    </div>
  )
}
