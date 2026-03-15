import { relations } from "drizzle-orm";
import { pgTable, pgEnum, varchar, boolean, timestamp, text } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: varchar("id", { length: 255 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: boolean("email_verified").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 })
    .references(() => users.id)
    .notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  token: varchar("token", { length: 255 }).notNull(),
  ipAddress: varchar("ip_address", { length: 255 }),
  userAgent: varchar("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const accounts = pgTable("accounts", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 })
    .references(() => users.id)
    .notNull(),
  accountId: varchar("account_id", { length: 255 }).notNull(),
  providerId: varchar("provider_id", { length: 255 }).notNull(),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const priorityEnum = pgEnum("priority", ["low", "medium", "high", "critical"]);
export const categoryEnum = pgEnum("category", ["todo", "inProgress", "done"]);

export const tasks = pgTable("tasks", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 })
    .references(() => users.id)
    .notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  project: varchar("project", { length: 255 }).notNull(),
  dueDate: timestamp("due_date").notNull(),
  priority: priorityEnum("priority").notNull(),
  category: categoryEnum("category").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const taskReminders = pgTable("task_reminders", {
  id: varchar("id", { length: 255 }).primaryKey(),
  taskId: varchar("task_id", { length: 255 })
    .references(() => tasks.id)
    .notNull(),
  notifExpReminderSent: boolean("notif_exp_reminder_sent").default(false),
  emailExpReminderSent: boolean("email_exp_reminder_sent").default(false),
  emailOverdueReminderSent: boolean("email_overdue_reminder_sent").default(false),
  notifOverdueReminderSent: boolean("notif_overdue_reminder_sent").default(false),
  emailSentTo: varchar("email_sent_to", { length: 255 }).references(() => users.email),
  isOpened: boolean("is_opened").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  tasks: many(tasks),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  user: one(users, {
    fields: [tasks.userId],
    references: [users.id],
  }),
  reminders: many(taskReminders),
}));

export const taskRemindersRelations = relations(taskReminders, ({ one }) => ({
  task: one(tasks, {
    fields: [taskReminders.taskId],
    references: [tasks.id],
  }),
}));

export const schema = {
  users,
  sessions,
  accounts,
  tasks,
  taskReminders,
};
