import crypto from "crypto";
import { db } from "./index";
import { taskReminders, tasks } from "./schema";
import { eq, asc } from "drizzle-orm";
import { buildProjectCode } from "@/lib/utils";

export type InsertTask = typeof tasks.$inferInsert;
export type SelectTask = typeof tasks.$inferSelect;

export async function createTask(task: InsertTask): Promise<SelectTask> {
  return db.transaction(async (tx) => {
    const [created] = await tx.insert(tasks).values(task).returning();

    await tx.insert(taskReminders).values({
      id: crypto.randomUUID(),
      taskId: created.id,
    });

    return created;
  });
}

export async function updateTaskReminderStatus(
  taskId: string,
  status: "nearlyExpired" | "overdue",
): Promise<boolean> {
  const existing = await db.query.taskReminders.findFirst({
    where: eq(taskReminders.taskId, taskId),
    columns: {
      id: true,
      notifExpReminderSent: true,
      notifOverdueReminderSent: true,
    },
  });

  const reminderUpdates =
    status === "nearlyExpired"
      ? {
          notifExpReminderSent: true,
        }
      : {
          notifOverdueReminderSent: true,
        };

  if (!existing) {
    await db.insert(taskReminders).values({
      id: crypto.randomUUID(),
      taskId,
      ...reminderUpdates,
    });

    return true;
  }

  const alreadyUpdated =
    status === "nearlyExpired" ? existing.notifExpReminderSent : existing.notifOverdueReminderSent;

  if (alreadyUpdated) {
    return false;
  }

  await db
    .update(taskReminders)
    .set({
      ...reminderUpdates,
      updatedAt: new Date(),
    })
    .where(eq(taskReminders.id, existing.id));

  return true;
}

async function getTaskByProject(project: string): Promise<SelectTask | undefined> {
  return db.query.tasks.findFirst({
    where: eq(tasks.project, project),
  });
}

export async function generateUniqueProjectCode(): Promise<string> {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const project = buildProjectCode();
    const existing = await getTaskByProject(project);

    if (!existing) {
      return project;
    }
  }

  throw new Error("Unable to generate a unique project code.");
}

export async function getAllTasks(): Promise<SelectTask[]> {
  return db.query.tasks.findMany({
    orderBy: asc(tasks.dueDate),
  });
}
