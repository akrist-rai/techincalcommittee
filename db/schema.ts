import { sql } from 'drizzle-orm';
import {
  boolean, check, integer, jsonb, pgTable, text, timestamp, uniqueIndex, uuid,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
}, (table) => [
  check('users_role_check', sql`${table.role} in ('admin', 'editor')`),
]);

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: text('token_hash').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
}, (table) => [
  uniqueIndex('sessions_token_hash_idx').on(table.tokenHash),
]);

export const clubs = pgTable('clubs', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  tagline: text('tagline').notNull().default(''),
  description: text('description').notNull().default(''),
  imgUrl: text('img_url').notNull().default(''),
  accent: text('accent').notNull().default('red'),
  orderIndex: integer('order_index').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  check('clubs_accent_check', sql`${table.accent} in ('red', 'cyan', 'yellow', 'violet', 'green')`),
]);

export const members = pgTable('members', {
  id: uuid('id').primaryKey().defaultRandom(),
  clubId: uuid('club_id').references(() => clubs.id, { onDelete: 'set null' }),
  name: text('name').notNull(),
  role: text('role').notNull().default(''),
  imgUrl: text('img_url').notNull().default(''),
  quote: text('quote'),
  stats: jsonb('stats').notNull().default([]),
  size: text('size').notNull().default('md'),
  orderIndex: integer('order_index').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  check('members_size_check', sql`${table.size} in ('wide', 'lg', 'md', 'sm')`),
]);

export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  clubId: uuid('club_id').references(() => clubs.id, { onDelete: 'set null' }),
  chapter: text('chapter').notNull().default(''),
  page: text('page').notNull().default(''),
  title: text('title').notNull(),
  tag: text('tag').notNull().default(''),
  dateLabel: text('date_label').notNull().default(''),
  description: text('description').notNull().default(''),
  orderIndex: integer('order_index').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const images = pgTable('images', {
  id: uuid('id').primaryKey().defaultRandom(),
  url: text('url').notNull(),
  altText: text('alt_text').notNull().default(''),
  uploadedBy: uuid('uploaded_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const sections = pgTable('sections', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: text('type').notNull(),
  title: text('title').notNull().default(''),
  subtitle: text('subtitle').notNull().default(''),
  orderIndex: integer('order_index').notNull().default(0),
  visible: boolean('visible').notNull().default(true),
  accent: text('accent').notNull().default('red'),
  config: jsonb('config').notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  check('sections_type_check', sql`${table.type} in ('members', 'events', 'stats', 'custom', 'clubs')`),
  check('sections_accent_check', sql`${table.accent} in ('red', 'cyan', 'yellow', 'violet', 'green')`),
]);
