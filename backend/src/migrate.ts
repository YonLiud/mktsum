import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { Client } from 'pg'

const client = new Client({
  connectionString: process.env.DATABASE_URL!,
})

await client.connect()
const db = drizzle(client)

await migrate(db, { migrationsFolder: './drizzle' })
await client.end()

console.log('Migrations applied successfully')