"use server";

import { getUserFromSession } from "@/lib/auth";
import { getAllTasksWithAssignee, type SelectTaskWithAssignee } from "@/lib/db/tasks";

export async function getTasksAction(): Promise<SelectTaskWithAssignee[]> {
  try {
    const session = await getUserFromSession();

    if (!session || !session.user) {
      throw new Error("You must be signed in to fetch tasks.");
    }

    return await getAllTasksWithAssignee();
  } catch (err) {
    console.error("Failed to fetch tasks:", err);
    return [];
  }
}
