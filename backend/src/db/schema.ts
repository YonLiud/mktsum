import { pgTable, text, boolean, timestamp, uniqueIndex, jsonb } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const users = pgTable('users', {
  user_id: text('user_id').primaryKey(),
  username: text('username').notNull().unique(),
  name: text('name').notNull(),
  password_hash: text('password_hash').notNull(),
  role: text('role', { enum: ['user', 'admin'] }).notNull().default('user'),
  ntfy_topic: text('ntfy_topic'),
  terms_accepted_at: timestamp('terms_accepted_at'),
  created_at: timestamp('created_at').defaultNow().notNull(),
})

export const sessions = pgTable('sessions', {
  session_id: text('session_id').primaryKey(),
  user_id: text('user_id').notNull().references(() => users.user_id, { onDelete: 'cascade' }),
  expires_at: timestamp('expires_at').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
})

export const briefings = pgTable('briefings', {
  briefing_id: text('briefing_id').primaryKey(),
  user_id: text('user_id').notNull().references(() => users.user_id),
  full_summary: text('full_summary').notNull(),
  short_summary: text('short_summary').notNull(),
  sources: jsonb('sources'),
  notif_sent: boolean('notif_sent').default(false).notNull(),
  is_public: boolean('is_public').default(false).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
})

export const watchlist = pgTable('watchlist', {
  watchlist_id: text('watchlist_id').primaryKey(),
  user_id: text('user_id').notNull().references(() => users.user_id),
  ticker: text('ticker').notNull().references(() => tickers.symbol),
  created_at: timestamp('created_at').defaultNow().notNull(),
}, (table: { user_id: any; ticker: any }) => [
  uniqueIndex('user_ticker_unique').on(table.user_id, table.ticker)
])

export const tickers = pgTable('tickers', {
  symbol: text('symbol').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
})

export const usersRelations = relations(users, ({ many }) => ({
  briefings: many(briefings),
  watchlist: many(watchlist),
  sessions: many(sessions),
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.user_id],
    references: [users.user_id],
  }),
}))

export const briefingsRelations = relations(briefings, ({ one }) => ({
  user: one(users, {
    fields: [briefings.user_id],
    references: [users.user_id],
  }),
}))

export const tickersRelations = relations(tickers, ({ many }) => ({
  watchlist: many(watchlist),
}))

export const watchlistRelations = relations(watchlist, ({ one }) => ({
  user: one(users, {
    fields: [watchlist.user_id],
    references: [users.user_id],
  }),
  ticker: one(tickers, {
    fields: [watchlist.ticker],
    references: [tickers.symbol],
  }),
}))