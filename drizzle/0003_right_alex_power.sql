CREATE TABLE "task_reminders" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"task_id" varchar(255) NOT NULL,
	"notif_exp_reminder_sent" boolean DEFAULT false,
	"email_exp_reminder_sent" boolean DEFAULT false,
	"email_overdue_reminder_sent" boolean DEFAULT false,
	"notif_overdue_reminder_sent" boolean DEFAULT false,
	"email_sent_to" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "task_reminders" ADD CONSTRAINT "task_reminders_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_reminders" ADD CONSTRAINT "task_reminders_email_sent_to_users_email_fk" FOREIGN KEY ("email_sent_to") REFERENCES "public"."users"("email") ON DELETE no action ON UPDATE no action;