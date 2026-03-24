import { pgTable, text, boolean, timestamp, uniqueIndex, jsonb } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const users = pgTable('users', {
  user_id: text('user_id').primaryKey(),
  name: text('name').notNull(),
  ntfy_topic: text('ntfy_topic').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
})

export const briefings = pgTable('briefings', {
  briefing_id: text('briefing_id').primaryKey(),
  user_id: text('user_id').notNull().references(() => users.user_id),
  full_summary: text('full_summary').notNull(),
  short_summary: text('short_summary').notNull(),
  sources: jsonb('sources'),
  notif_sent: boolean('notif_sent').default(false).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
})

export const watchlist = pgTable('watchlist', {
  watchlist_id: text('watchlist_id').primaryKey(),
  user_id: text('user_id').notNull().references(() => users.user_id),
  ticker: text('ticker').notNull().references(() => tickers.symbol),
  created_at: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
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