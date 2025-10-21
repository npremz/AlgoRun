import { pgTable, serial, integer, text, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';

// Auth tables (Lucia)
export const user = pgTable('user', {
	id: text('id').primaryKey(),
	age: integer('age'),
	username: text('username').notNull().unique(),
	passwordHash: text('password_hash').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
});

export const session = pgTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull().references(() => user.id),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull()
});

// Problem lists
export const problemList = pgTable('problem_list', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	description: text('description'),
	createdBy: text('created_by').notNull().references(() => user.id),
	isPublic: boolean('is_public').notNull().default(false),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
});

// Individual problems in a list
export const problem = pgTable('problem', {
	id: serial('id').primaryKey(),
	listId: integer('list_id').notNull().references(() => problemList.id, { onDelete: 'cascade' }),
	title: text('title').notNull(),
	description: text('description'),
	difficulty: text('difficulty').notNull(), // 'easy', 'medium', 'hard'
	order: integer('order').notNull(), // order in the list
	tags: jsonb('tags').$type<string[]>().default([]),
	externalUrl: text('external_url'), // link to leetcode/other platform
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
});

// Speedrun attempts
export const speedrunAttempt = pgTable('speedrun_attempt', {
	id: serial('id').primaryKey(),
	userId: text('user_id').notNull().references(() => user.id),
	listId: integer('list_id').notNull().references(() => problemList.id),
	startedAt: timestamp('started_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
	completedAt: timestamp('completed_at', { withTimezone: true, mode: 'date' }),
	totalTimeSeconds: integer('total_time_seconds'), // total time in seconds
	problemsCompleted: integer('problems_completed').notNull().default(0),
	problemsTotal: integer('problems_total').notNull(),
	isCompleted: boolean('is_completed').notNull().default(false),
	problemTimings: jsonb('problem_timings').$type<{ problemId: number; timeSeconds: number; completed: boolean }[]>().default([])
});

// Type exports
export type Session = typeof session.$inferSelect;
export type User = typeof user.$inferSelect;
export type ProblemList = typeof problemList.$inferSelect;
export type Problem = typeof problem.$inferSelect;
export type SpeedrunAttempt = typeof speedrunAttempt.$inferSelect;
