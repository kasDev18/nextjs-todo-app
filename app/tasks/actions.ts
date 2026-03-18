"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { Category, Priority } from "@/app/(home)/components/constants";
import { getUserFromSession } from "@/lib/auth";
import {
  createTask,
  deleteTask,
  generateUniqueProjectCode,
  getTaskById,
  markTaskReminderOpened,
  updateTask,
  updateTaskCategory,
  type SelectTask,
} from "@/lib/db/tasks";
import { createTaskSchema } from "@/lib/validations/task";
import { categoryEnum } from "@/lib/db/schema";
import { getTaskStatus } from "@/notifications/utils";

type TaskActionFormData = {
  title: string;
  description: string;
  dueDate: string;
  priority: string;
  category: string;
};

type TaskMutationResult = { success: true; task: SelectTask } | { success: false; error: string };

/*
  Builds the due date with the current time.
  @param dueDate - The due date to build.
  @returns The due date with the current time.
*/
function buildDueDateWithCurrentTime(dueDate: string): Date {
  const now = new Date();

  return new Date(
    `${dueDate}T${String(now.getUTCHours()).padStart(2, "0")}:${String(now.getUTCMinutes()).padStart(2, "0")}:${String(now.getUTCSeconds()).padStart(2, "0")}.${String(now.getUTCMilliseconds()).padStart(3, "0")}Z`,
  );
}

/*
  Creates a new task.
  @param formData - The form data to create the task from.
  @returns The created task.
*/
export async function createTaskAction(formData: TaskActionFormData): Promise<TaskMutationResult> {
  try {
    const session = await getUserFromSession();

    if (!session?.user) {
      return { success: false, error: "You must be signed in to create a task." };
    }

    const parsed = createTaskSchema.safeParse(formData);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Invalid input.";
      return { success: false, error: firstError };
    }

    const { title, description, dueDate, priority, category } = parsed.data;
    const project = await generateUniqueProjectCode();
    const nextDueDate = buildDueDateWithCurrentTime(dueDate);

    const task = await createTask(
      {
        id: crypto.randomUUID(),
        userId: session.user.id,
        title,
        description,
        dueDate: nextDueDate,
        project,
        priority: priority as Priority,
        category: category as Category,
      },
      getTaskStatus(nextDueDate),
    );

    revalidatePath("/");

    return { success: true, task };
  } catch (err) {
    console.error("Failed to create task:", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

/*
  Updates a task.
  @param taskId - The ID of the task to update.
  @param formData - The form data to update the task from.
  @returns The updated task.
*/
export async function updateTaskAction(
  taskId: string,
  formData: TaskActionFormData,
): Promise<TaskMutationResult> {
  try {
    const session = await getUserFromSession();

    if (!session?.user) {
      return { success: false, error: "You must be signed in to edit a task." };
    }

    const existingTask = await getTaskById(taskId);

    if (!existingTask || existingTask.userId !== session.user.id) {
      return { success: false, error: "Task not found." };
    }

    const parsed = createTaskSchema.safeParse(formData);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Invalid input.";
      return { success: false, error: firstError };
    }

    const { title, description, dueDate, priority, category } = parsed.data;
    const nextDueDate = buildDueDateWithCurrentTime(dueDate);
    const task = await updateTask(
      taskId,
      {
        title,
        description,
        dueDate: nextDueDate,
        priority: priority as Priority,
        category: category as Category,
      },
      getTaskStatus(nextDueDate),
    );

    if (!task) {
      return { success: false, error: "Task not found." };
    }

    revalidatePath("/");
    revalidatePath(`/tasks/${taskId}/edit`);

    return { success: true, task };
  } catch (err) {
    console.error("Failed to update task:", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

/*
  Deletes a task.
  @param taskId - The ID of the task to delete.
  @returns True when the task existed and was deleted, false otherwise.
*/
export async function deleteTaskAction(
  taskId: string,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const session = await getUserFromSession();

    if (!session?.user) {
      return { success: false, error: "You must be signed in to delete a task." };
    }

    const existingTask = await getTaskById(taskId);

    if (!existingTask || existingTask.userId !== session.user.id) {
      return { success: false, error: "Task not found." };
    }

    const deleted = await deleteTask(taskId);

    if (!deleted) {
      return { success: false, error: "Task not found." };
    }

    revalidatePath("/");
    revalidatePath(`/tasks/${taskId}/edit`);

    return { success: true };
  } catch (err) {
    console.error("Failed to delete task:", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

/*
  Moves a task to another board column.
  @param taskId - The ID of the task to move.
  @param category - The destination category.
  @returns The updated task.
*/
export async function moveTaskAction(
  taskId: string,
  category: string,
): Promise<TaskMutationResult> {
  try {
    const session = await getUserFromSession();

    if (!session?.user) {
      return { success: false, error: "You must be signed in to move a task." };
    }

    if (!categoryEnum.enumValues.includes(category as Category)) {
      return { success: false, error: "Invalid task column." };
    }

    const existingTask = await getTaskById(taskId);

    if (!existingTask || existingTask.userId !== session.user.id) {
      return { success: false, error: "Task not found." };
    }

    if (existingTask.category === category) {
      return { success: true, task: existingTask };
    }

    const task = await updateTaskCategory(taskId, category as Category);

    if (!task) {
      return { success: false, error: "Task not found." };
    }

    revalidatePath("/");
    revalidatePath(`/tasks/${taskId}/edit`);

    return { success: true, task };
  } catch (err) {
    console.error("Failed to move task:", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

/*
  Marks a task notification as opened for the signed-in task owner.
  @param taskId - The ID of the task whose notification was opened.
  @returns True when the notification state changed, false otherwise.
*/
export async function markTaskNotificationOpenedAction(taskId: string): Promise<boolean> {
  try {
    const session = await getUserFromSession();

    if (!session?.user) {
      return false;
    }

    const didMarkOpened = await markTaskReminderOpened(taskId, session.user.id);

    if (didMarkOpened) {
      revalidatePath("/");
      revalidatePath(`/tasks/${taskId}/edit`);
    }

    return didMarkOpened;
  } catch (err) {
    console.error("Failed to mark task notification as opened:", err);
    return false;
  }
}
