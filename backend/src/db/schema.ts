import { pgTable, text, boolean, timestamp } from 'drizzle-orm/pg-core'
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
  sources: text('sources').array(),
  notif_sent: boolean('notif_sent').default(false).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
})

export const watchlist = pgTable('watchlist', {
  watchlist_id: text('watchlist_id').primaryKey(),
  user_id: text('user_id').notNull().references(() => users.user_id),
  ticker: text('ticker').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
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

export const watchlistRelations = relations(watchlist, ({ one }) => ({
  user: one(users, {
    fields: [watchlist.user_id],
    references: [users.user_id],
  }),
}))