"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { Category, Priority } from "@/app/(home)/components/constants";
import { getUserFromSession } from "@/lib/auth";
import {
  createTask,
  generateUniqueProjectCode,
  getTaskById,
  updateTask,
  type SelectTask,
} from "@/lib/db/tasks";
import { createTaskSchema } from "@/lib/validations/task";
import { getTaskStatus } from "@/notifications/utils";

type TaskActionFormData = {
  title: string;
  description: string;
  dueDate: string;
  priority: string;
  category: string;
};

type TaskMutationResult = { success: true; task: SelectTask } | { success: false; error: string };

function buildDueDateWithCurrentTime(dueDate: string) {
  const now = new Date();

  return new Date(
    `${dueDate}T${String(now.getUTCHours()).padStart(2, "0")}:${String(now.getUTCMinutes()).padStart(2, "0")}:${String(now.getUTCSeconds()).padStart(2, "0")}.${String(now.getUTCMilliseconds()).padStart(3, "0")}Z`,
  );
}

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
