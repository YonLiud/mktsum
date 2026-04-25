import { Client, Pool } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'

if (!process.env.TEST_DATABASE_URL) {
  throw new Error(
    'TEST_DATABASE_URL is not set. Add it to .env, e.g.:\n' +
      'TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mktsum_test'
  )
}

// Point the app's db module at the test database.
// This must happen before any test file imports src/db/index.ts.
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL

// --- 1. Create the test database if it doesn't already exist ---
const testUrl = new URL(process.env.TEST_DATABASE_URL)
const testDbName = testUrl.pathname.slice(1) // strip leading "/"

const adminUrl = new URL(process.env.TEST_DATABASE_URL)
adminUrl.pathname = '/postgres'

const adminClient = new Client({ connectionString: adminUrl.toString() })
await adminClient.connect()

const { rowCount } = await adminClient.query(
  'SELECT 1 FROM pg_database WHERE datname = $1',
  [testDbName]
)
if (!rowCount) {
  await adminClient.query(`CREATE DATABASE "${testDbName}"`)
}
await adminClient.end()

// --- 2. Reset schema and run migrations fresh ---
const pool = new Pool({ connectionString: process.env.TEST_DATABASE_URL })
const db = drizzle(pool)
// Drop and recreate the public schema so migrations always start from a clean slate.
// This is necessary after migration consolidation: the old __drizzle_migrations
// records don't match the new consolidated file, causing duplicate table errors.
await pool.query('DROP SCHEMA IF EXISTS drizzle CASCADE')
await pool.query('DROP SCHEMA public CASCADE')
await pool.query('CREATE SCHEMA public')
// import.meta.dir is the absolute path of this file's directory (Bun-specific)
await migrate(db, { migrationsFolder: `${import.meta.dir}/../../drizzle` })
await pool.end()
