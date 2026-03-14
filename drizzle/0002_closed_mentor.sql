ALTER TABLE "tasks" ADD COLUMN "project" varchar(255);--> statement-breakpoint
UPDATE "tasks"
SET "project" = 'PROJ-' || upper(substr("id", 1, 4))
WHERE "project" IS NULL;--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "project" SET NOT NULL;