ALTER TABLE "task_reminders" ALTER COLUMN "email_sent_to" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "task_reminders" ALTER COLUMN "email_sent_to" DROP NOT NULL;