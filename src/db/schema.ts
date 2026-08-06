import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, jsonb } from 'drizzle-orm/pg-core';

// Users table synced with Firebase Auth UID
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  name: text('name'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Leads table for sales telecalling
export const leads = pgTable('leads', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  email: text('email'),
  company: text('company').notNull(),
  industry: text('industry'),
  currentSoftware: text('current_software'),
  preferredLanguage: text('preferred_language').default('English'),
  status: text('status').default('New'),
  score: integer('score').default(50),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Call logs and recordings history
export const callLogs = pgTable('call_logs', {
  id: serial('id').primaryKey(),
  leadId: integer('lead_id').references(() => leads.id),
  customerName: text('customer_name').notNull(),
  durationSeconds: integer('duration_seconds').default(0),
  language: text('language').default('English'),
  outcome: text('outcome'),
  summary: text('summary'),
  transcript: jsonb('transcript'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  leads: many(leads),
}));

export const leadsRelations = relations(leads, ({ one, many }) => ({
  author: one(users, {
    fields: [leads.userId],
    references: [users.id],
  }),
  callLogs: many(callLogs),
}));

export const callLogsRelations = relations(callLogs, ({ one }) => ({
  lead: one(leads, {
    fields: [callLogs.leadId],
    references: [leads.id],
  }),
}));
