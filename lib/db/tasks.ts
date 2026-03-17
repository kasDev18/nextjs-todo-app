import crypto from "crypto";
import { db, getClient } from "./index";
import { taskReminders, tasks } from "./schema";
import { eq, asc } from "drizzle-orm";
import { buildProjectCode } from "@/lib/utils";
import { getTaskStatus } from "@/notifications/utils";

export type InsertTask = typeof tasks.$inferInsert;
export type SelectTask = typeof tasks.$inferSelect;
export type TaskReminderStatus = "nearlyExpired" | "overdue" | null;
export type TaskReminderRecord = {
  id: string;
  notifExpReminderSent: boolean | null;
  notifOverdueReminderSent: boolean | null;
  emailExpReminderSent: boolean | null;
  emailOverdueReminderSent: boolean | null;
  emailSentTo: string | null;
  isOpened: boolean | null;
};
export type SelectTaskWithAssignee = SelectTask & {
  assigneeName: string;
};
export type SelectTaskWithReminder = SelectTask & {
  reminder: TaskReminderRecord | null;
};
export type SelectTaskWithReminderStatus = SelectTask & {
  reminder: TaskReminderRecord | null;
  userEmail: string | null;
  userName: string;
};
type SendTaskReminderCallback = () => Promise<void>;
type DbTx = Parameters<Parameters<typeof db.transaction>[0]>[0];

type ReminderUpdateOptions = {
  resetEmailStatus?: boolean;
  emailSentTo?: string | null;
};

function hasTaskReminderEmailBeenSent(
  reminder:
    | {
        email_exp_reminder_sent: boolean | null;
        email_overdue_reminder_sent: boolean | null;
      }
    | null
    | undefined,
  status: Exclude<TaskReminderStatus, null>,
) {
  return status === "nearlyExpired"
    ? Boolean(reminder?.email_exp_reminder_sent)
    : Boolean(reminder?.email_overdue_reminder_sent);
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
      emailExpReminderSent: true,
      emailOverdueReminderSent: true,
      emailSentTo: true,
      isOpened: true,
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
  options: ReminderUpdateOptions = {},
): Promise<boolean> {
  const existing = existingReminder ?? (await getTaskReminderRecord(taskId));
  const notificationUpdates = options.resetEmailStatus
    ? {
        // A due-date edit starts a fresh reminder cycle.
        notifExpReminderSent: status === "nearlyExpired",
        notifOverdueReminderSent: status === "overdue",
      }
    : {
        // Cron sync should preserve previously reached states as a task progresses.
        notifExpReminderSent: Boolean(existing?.notifExpReminderSent || status === "nearlyExpired"),
        notifOverdueReminderSent: Boolean(
          existing?.notifOverdueReminderSent || status === "overdue",
        ),
      };
  const reminderUpdates = {
    ...notificationUpdates,
    ...(options.resetEmailStatus
      ? {
          emailExpReminderSent: false,
          emailOverdueReminderSent: false,
          emailSentTo: options.emailSentTo ?? null,
          isOpened: false,
        }
      : {}),
  };

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
    existing.notifOverdueReminderSent === reminderUpdates.notifOverdueReminderSent &&
    (!options.resetEmailStatus ||
      (existing.emailExpReminderSent === reminderUpdates.emailExpReminderSent &&
        existing.emailOverdueReminderSent === reminderUpdates.emailOverdueReminderSent &&
        existing.emailSentTo === reminderUpdates.emailSentTo &&
        existing.isOpened === reminderUpdates.isOpened));

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

    await updateTaskReminderRecord(created.id, reminderStatus, tx, null, {
      resetEmailStatus: true,
    });

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
  Gets a task and its reminder record by task ID.
  @param taskId - The ID of the task to get.
  @returns The task with its reminder record, or undefined if no task exists.
*/
export async function getTaskByIdWithReminder(
  taskId: string,
): Promise<SelectTaskWithReminder | undefined> {
  const task = await db.query.tasks.findFirst({
    where: eq(tasks.id, taskId),
    with: {
      reminders: {
        columns: {
          id: true,
          notifExpReminderSent: true,
          notifOverdueReminderSent: true,
          emailExpReminderSent: true,
          emailOverdueReminderSent: true,
          emailSentTo: true,
          isOpened: true,
        },
      },
    },
  });

  if (!task) {
    return undefined;
  }

  const { reminders, ...taskFields } = task;

  return {
    ...taskFields,
    reminder: reminders[0] ?? null,
  };
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
      await updateTaskReminderRecord(taskId, reminderStatus, tx, null, {
        resetEmailStatus: true,
      });
    }

    return updated;
  });
}

/*
  Updates only the category for a task.
  @param taskId - The ID of the task to update.
  @param category - The next category for the task.
  @returns The updated task, or undefined if no task exists.
*/
export async function updateTaskCategory(
  taskId: string,
  category: InsertTask["category"],
): Promise<SelectTask | undefined> {
  const [updated] = await db
    .update(tasks)
    .set({
      category,
      updatedAt: new Date(),
    })
    .where(eq(tasks.id, taskId))
    .returning();

  return updated;
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
  Sends a reminder email once for a given task.
  @param taskId - The ID of the task to update.
  @param status - The reminder status that is being emailed.
  @param emailSentTo - The email address that received the reminder.
  @param sendReminderEmail - Callback that sends the reminder email.
  @returns True if the email was sent and persisted, false otherwise.
*/
export async function sendTaskReminderEmailOnce(
  taskId: string,
  status: Exclude<TaskReminderStatus, null>,
  emailSentTo: string,
  sendReminderEmail: SendTaskReminderCallback,
): Promise<boolean> {
  const client = await getClient();

  try {
    const lockResult = await client.query<{ locked: boolean }>(
      "SELECT pg_try_advisory_lock(hashtext($1)) AS locked",
      [taskId],
    );

    if (!lockResult.rows[0]?.locked) {
      return false;
    }

    const reminderResult = await client.query<{
      id: string;
      email_exp_reminder_sent: boolean | null;
      email_overdue_reminder_sent: boolean | null;
    }>(
      `SELECT id, email_exp_reminder_sent, email_overdue_reminder_sent
       FROM task_reminders
       WHERE task_id = $1`,
      [taskId],
    );
    const existingReminder = reminderResult.rows[0];
    const hasEmailBeenSent = hasTaskReminderEmailBeenSent(existingReminder, status);

    if (hasEmailBeenSent) {
      return false;
    }

    await sendReminderEmail();

    if (existingReminder) {
      await client.query(
        `UPDATE task_reminders
         SET email_exp_reminder_sent = CASE
               WHEN $2 = 'nearlyExpired' THEN true
               ELSE email_exp_reminder_sent
             END,
             email_overdue_reminder_sent = CASE
               WHEN $2 = 'overdue' THEN true
               ELSE email_overdue_reminder_sent
             END,
             email_sent_to = $3,
             updated_at = NOW()
         WHERE id = $1`,
        [existingReminder.id, status, emailSentTo],
      );

      return true;
    }

    await client.query(
      `INSERT INTO task_reminders (
         id,
         task_id,
         notif_exp_reminder_sent,
         email_exp_reminder_sent,
         email_overdue_reminder_sent,
         notif_overdue_reminder_sent,
         email_sent_to,
         is_opened,
         created_at,
         updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, false, NOW(), NOW())`,
      [
        crypto.randomUUID(),
        taskId,
        status === "nearlyExpired",
        status === "nearlyExpired",
        status === "overdue",
        status === "overdue",
        emailSentTo,
      ],
    );

    return true;
  } finally {
    try {
      await client.query("SELECT pg_advisory_unlock(hashtext($1))", [taskId]);
    } finally {
      client.release();
    }
  }
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
          emailExpReminderSent: true,
          emailOverdueReminderSent: true,
          emailSentTo: true,
          isOpened: true,
        },
      },
      user: {
        columns: {
          email: true,
          name: true,
        },
      },
    },
    orderBy: asc(tasks.dueDate),
  });

  return taskRows.map(({ reminders, user, ...task }) => ({
    ...task,
    reminder: reminders[0] ?? null,
    userEmail: user?.email ?? null,
    userName: user?.name ?? "Unknown User",
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
  Gets all tasks by user ID with reminder state.
  @param userId - The ID of the user to get the tasks for.
  @returns All tasks by user ID with reminder state.
*/
export async function getTasksByUserIdWithReminderStatus(
  userId: string,
): Promise<SelectTaskWithReminder[]> {
  const taskRows = await db.query.tasks.findMany({
    where: eq(tasks.userId, userId),
    with: {
      reminders: {
        columns: {
          id: true,
          notifExpReminderSent: true,
          notifOverdueReminderSent: true,
          emailExpReminderSent: true,
          emailOverdueReminderSent: true,
          emailSentTo: true,
          isOpened: true,
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
  Marks a task reminder as opened for the owning user.
  @param taskId - The ID of the task whose reminder was opened.
  @param userId - The ID of the user opening the reminder.
  @returns True when the reminder state changed, false otherwise.
*/
export async function markTaskReminderOpened(taskId: string, userId: string): Promise<boolean> {
  const task = await getTaskById(taskId);

  if (!task || task.userId !== userId) {
    return false;
  }

  const status = getTaskStatus(new Date(task.dueDate));

  if (!status) {
    return false;
  }

  const existingReminder = await getTaskReminderRecord(taskId);

  if (!existingReminder) {
    await db.insert(taskReminders).values({
      id: crypto.randomUUID(),
      taskId,
      notifExpReminderSent: status === "nearlyExpired",
      notifOverdueReminderSent: status === "overdue",
      isOpened: true,
    });

    return true;
  }

  if (existingReminder.isOpened) {
    return false;
  }

  await db
    .update(taskReminders)
    .set({
      isOpened: true,
      updatedAt: new Date(),
    })
    .where(eq(taskReminders.id, existingReminder.id));

  return true;
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
