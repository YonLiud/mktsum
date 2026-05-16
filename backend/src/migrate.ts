import { drizzle } from 'drizzle-orm/bun-sql'
import { migrate } from 'drizzle-orm/bun-sql/migrator'

const MAX_ATTEMPTS = 10
const RETRY_DELAY_MS = 3000

for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
  try {
    const db = drizzle(process.env.DATABASE_URL!)
    await migrate(db, { migrationsFolder: './drizzle' })
    console.log('Migrations applied successfully')
    break
  } catch (e) {
    if (attempt === MAX_ATTEMPTS) throw e
    console.error(`Migration attempt ${attempt} failed, retrying in ${RETRY_DELAY_MS}ms...`, e)
    await Bun.sleep(RETRY_DELAY_MS)
  }
}
