import { SQL } from 'bun'
import { drizzle } from 'drizzle-orm/bun-sql'
import { migrate } from 'drizzle-orm/bun-sql/migrator'

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

const adminSql = new SQL(adminUrl.toString())
const rows = await adminSql`SELECT 1 FROM pg_database WHERE datname = ${testDbName}`
if (rows.length === 0) {
  await adminSql.unsafe(`CREATE DATABASE "${testDbName}"`)
}
await adminSql.end()

// --- 2. Reset schema and run migrations fresh ---
// Drop and recreate the public schema so migrations always start from a clean slate.
// This is necessary after migration consolidation: the old __drizzle_migrations
// records don't match the new consolidated file, causing duplicate table errors.
const testSql = new SQL(process.env.TEST_DATABASE_URL)
await testSql.unsafe('DROP SCHEMA IF EXISTS drizzle CASCADE')
await testSql.unsafe('DROP SCHEMA public CASCADE')
await testSql.unsafe('CREATE SCHEMA public')
// import.meta.dir is the absolute path of this file's directory (Bun-specific)
await migrate(drizzle(testSql), { migrationsFolder: `${import.meta.dir}/../../drizzle` })
await testSql.end()
