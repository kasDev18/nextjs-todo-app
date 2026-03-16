import crypto from "crypto";
import { db } from "./index";
import { taskReminders, tasks } from "./schema";
import { eq, asc } from "drizzle-orm";
import { buildProjectCode } from "@/lib/utils";

export type InsertTask = typeof tasks.$inferInsert;
export type SelectTask = typeof tasks.$inferSelect;
export type TaskReminderStatus = "nearlyExpired" | "overdue" | null;
export type TaskReminderRecord = {
  id: string;
  notifExpReminderSent: boolean | null;
  notifOverdueReminderSent: boolean | null;
};
export type SelectTaskWithAssignee = SelectTask & {
  assigneeName: string;
};
export type SelectTaskWithReminderStatus = SelectTask & {
  reminder: TaskReminderRecord | null;
};
type DbTx = Parameters<Parameters<typeof db.transaction>[0]>[0];

/*
  Builds the reminder updates for a given task reminder status.
  @param status - The status of the task reminder.
  @returns The reminder updates to apply to the task reminder record.
*/
function getReminderUpdates(status: TaskReminderStatus) {
  return {
    notifExpReminderSent: status === "nearlyExpired",
    notifOverdueReminderSent: status === "overdue",
  };
}

/*
  Gets the task reminder record for a given task.
  @param taskId - The ID of the task to get the reminder record for.
  @returns The task reminder record, or null if no record exists.
*/
async function getTaskReminderRecord(taskId: string): Promise<TaskReminderRecord | null> {
  const existing = await db.query.taskReminders.findFirst({
    where: eq(taskReminders.taskId, taskId),
    columns: {
      id: true,
      notifExpReminderSent: true,
      notifOverdueReminderSent: true,
    },
  });

  return existing ?? null;
}

/*
  Updates the task reminder record for a given task.
  @param taskId - The ID of the task to update.
  @param status - The status of the task reminder.
  @param tx - The database transaction to use.
  @param existingReminder - The existing reminder record to use.
  @returns True if the reminder record was updated, false otherwise.
*/
async function updateTaskReminderRecord(
  taskId: string,
  status: TaskReminderStatus,
  tx: DbTx,
  existingReminder?: TaskReminderRecord | null,
): Promise<boolean> {
  const existing = existingReminder ?? (await getTaskReminderRecord(taskId));
  const reminderUpdates = getReminderUpdates(status);

  if (!existing) {
    await tx.insert(taskReminders).values({
      id: crypto.randomUUID(),
      taskId,
      ...reminderUpdates,
    });

    return true;
  }

  const alreadyUpdated =
    existing.notifExpReminderSent === reminderUpdates.notifExpReminderSent &&
    existing.notifOverdueReminderSent === reminderUpdates.notifOverdueReminderSent;

  if (alreadyUpdated) {
    return false;
  }

  await tx
    .update(taskReminders)
    .set({
      ...reminderUpdates,
      updatedAt: new Date(),
    })
    .where(eq(taskReminders.id, existing.id));

  return true;
}

/*
  Creates a new task.
  @param task - The task to create.
  @param reminderStatus - The status of the task reminder.
  @returns The created task.
*/
export async function createTask(
  task: InsertTask,
  reminderStatus: TaskReminderStatus = null,
): Promise<SelectTask> {
  return db.transaction(async (tx) => {
    const [created] = await tx.insert(tasks).values(task).returning();

    await updateTaskReminderRecord(created.id, reminderStatus, tx);

    return created;
  });
}

/*
  Gets a task by its ID.
  @param taskId - The ID of the task to get.
  @returns The task, or undefined if no task exists.
*/
export async function getTaskById(taskId: string): Promise<SelectTask | undefined> {
  return db.query.tasks.findFirst({
    where: eq(tasks.id, taskId),
  });
}

/*
  Updates a task.
  @param taskId - The ID of the task to update.
  @param updates - The updates to apply to the task.
  @param reminderStatus - The status of the task reminder.
  @returns The updated task, or undefined if no task exists.
*/
type UpdateTaskInput = Pick<
  InsertTask,
  "title" | "description" | "dueDate" | "priority" | "category"
>;

export async function updateTask(
  taskId: string,
  updates: UpdateTaskInput,
  reminderStatus?: TaskReminderStatus,
): Promise<SelectTask | undefined> {
  return db.transaction(async (tx) => {
    const [updated] = await tx
      .update(tasks)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, taskId))
      .returning();

    if (!updated) {
      return undefined;
    }

    if (reminderStatus !== undefined) {
      await updateTaskReminderRecord(taskId, reminderStatus, tx);
    }

    return updated;
  });
}

/*
  Deletes a task and its reminder records.
  @param taskId - The ID of the task to delete.
  @returns True when the task existed and was deleted, false otherwise.
*/
export async function deleteTask(taskId: string): Promise<boolean> {
  return db.transaction(async (tx) => {
    await tx.delete(taskReminders).where(eq(taskReminders.taskId, taskId));

    const [deleted] = await tx.delete(tasks).where(eq(tasks.id, taskId)).returning({
      id: tasks.id,
    });

    return Boolean(deleted);
  });
}

/*
  Syncs the task reminder status.
  @param taskId - The ID of the task to sync the reminder status for.
  @param status - The status of the task reminder.
  @param existingReminder - The existing reminder record to use.
  @returns True if the reminder record was updated, false otherwise.
*/
export async function syncTaskReminderStatus(
  taskId: string,
  status: TaskReminderStatus,
  existingReminder?: TaskReminderRecord | null,
): Promise<boolean> {
  return db.transaction((tx) => updateTaskReminderRecord(taskId, status, tx, existingReminder));
}

/*
  Gets a task by its project code.
  @param project - The project code to get the task for.
  @returns The task, or undefined if no task exists.
*/
async function getTaskByProject(project: string): Promise<SelectTask | undefined> {
  return db.query.tasks.findFirst({
    where: eq(tasks.project, project),
  });
}

/*
  Generates a unique project code.
  @returns The unique project code.
*/
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

/*
  Gets all tasks.
  @returns All tasks.
*/
export async function getAllTasks(): Promise<SelectTask[]> {
  return db.query.tasks.findMany({
    orderBy: asc(tasks.dueDate),
  });
}

/*
  Gets all tasks with reminder status.
  @returns All tasks with reminder status.
*/
export async function getAllTasksWithReminderStatus(): Promise<SelectTaskWithReminderStatus[]> {
  const taskRows = await db.query.tasks.findMany({
    with: {
      reminders: {
        columns: {
          id: true,
          notifExpReminderSent: true,
          notifOverdueReminderSent: true,
        },
      },
    },
    orderBy: asc(tasks.dueDate),
  });

  return taskRows.map(({ reminders, ...task }) => ({
    ...task,
    reminder: reminders[0] ?? null,
  }));
}

/*
  Gets all tasks by user ID.
  @param userId - The ID of the user to get the tasks for.
  @returns All tasks by user ID.
*/
export async function getTasksByUserId(userId: string): Promise<SelectTask[]> {
  return db.query.tasks.findMany({
    where: eq(tasks.userId, userId),
    orderBy: asc(tasks.dueDate),
  });
}

/*
  Gets all tasks with assignee.
  @returns All tasks with assignee.
*/
export async function getAllTasksWithAssignee(): Promise<SelectTaskWithAssignee[]> {
  const taskRows = await db.query.tasks.findMany({
    with: {
      user: {
        columns: {
          name: true,
        },
      },
    },
    orderBy: asc(tasks.dueDate),
  });

  return taskRows.map(({ user, ...task }) => ({
    ...task,
    assigneeName: user?.name ?? "Unknown User",
  }));
}
