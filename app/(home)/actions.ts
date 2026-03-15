"use server";

import { getUserFromSession } from "@/lib/auth";
import {
  createTask,
  generateUniqueProjectCode,
  getAllTasks,
  type SelectTask,
} from "@/lib/db/tasks";
import { createTaskSchema } from "@/lib/validations/task";
import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { Category, Priority, type CreateTaskResult } from "./components/constants";

export async function createTaskAction(formData: {
  title: string;
  description: string;
  dueDate: string;
  priority: string;
  category: string;
}): Promise<CreateTaskResult> {
  try {
    const session = await getUserFromSession();

    if (!session || !session.user) {
      return { success: false, error: "You must be signed in to create a task." };
    }

    const parsed = createTaskSchema.safeParse(formData);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Invalid input.";
      return { success: false, error: firstError };
    }

    const { title, description, dueDate, priority, category } = parsed.data;
    const project = await generateUniqueProjectCode();

    const now = new Date();

    const dueDateWithCurrentTime = new Date(
      `${dueDate}T${String(now.getUTCHours()).padStart(2, "0")}:${String(now.getUTCMinutes()).padStart(2, "0")}:${String(now.getUTCSeconds()).padStart(2, "0")}.${String(now.getUTCMilliseconds()).padStart(3, "0")}Z`,
    );

    const task = await createTask({
      id: crypto.randomUUID(),
      userId: session.user.id,
      title,
      description,
      dueDate: dueDateWithCurrentTime,
      project,
      priority: priority as Priority,
      category: category as Category,
    });

    revalidatePath("/");

    return { success: true, task };
  } catch (err) {
    console.error("Failed to create task:", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function getTasksAction(): Promise<SelectTask[]> {
  try {
    const session = await getUserFromSession();

    if (!session || !session.user) {
      throw new Error("You must be signed in to fetch tasks.");
    }

    return await getAllTasks();
  } catch (err) {
    console.error("Failed to fetch tasks:", err);
    return [];
  }
}
