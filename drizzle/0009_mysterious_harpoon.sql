ALTER TABLE "task_reminders" DROP CONSTRAINT "task_reminders_assignee_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_assignee_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "task_reminders" DROP COLUMN "assignee_id";--> statement-breakpoint
ALTER TABLE "tasks" DROP COLUMN "assignee_id";