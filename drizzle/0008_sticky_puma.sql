ALTER TABLE "tasks" ALTER COLUMN "due_date" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "task_reminders" ADD COLUMN "assignee_id" varchar(255);--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "assignee_id" varchar(255);--> statement-breakpoint
UPDATE "tasks" SET "assignee_id" = "user_id" WHERE "assignee_id" IS NULL;--> statement-breakpoint
UPDATE "task_reminders"
SET "assignee_id" = "tasks"."assignee_id"
FROM "tasks"
WHERE "task_reminders"."task_id" = "tasks"."id"
  AND "task_reminders"."assignee_id" IS NULL;--> statement-breakpoint
ALTER TABLE "task_reminders" ALTER COLUMN "assignee_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "assignee_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "task_reminders" ADD CONSTRAINT "task_reminders_assignee_id_users_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assignee_id_users_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;