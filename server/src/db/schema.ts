import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

// 사용자 테이블 스키마
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

// 사용자 타입 정의
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type UpdateUser = Partial<Omit<NewUser, 'id' | 'createdAt'>>

// 수면 기록 테이블 스키마
export const sleepRecords = sqliteTable('sleep_records', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  date: integer('date', { mode: 'timestamp' }).notNull(),
  sleepStartTime: integer('sleep_start_time', { mode: 'timestamp' }).notNull(),
  sleepEndTime: integer('sleep_end_time', { mode: 'timestamp' }).notNull(),
  totalSleepHours: integer('total_sleep_hours').notNull(),
  quality: integer('quality').notNull(),
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

export type SleepRecord = typeof sleepRecords.$inferSelect
export type NewSleepRecord = typeof sleepRecords.$inferInsert
export type UpdateSleepRecord = Partial<Omit<NewSleepRecord, 'id' | 'createdAt' | 'userId'>>
