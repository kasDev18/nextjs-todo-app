import { db } from "./index";
import { tasks } from "./schema";
import { eq, asc } from "drizzle-orm";
import { buildProjectCode } from "@/lib/utils";

export type InsertTask = typeof tasks.$inferInsert;
export type SelectTask = typeof tasks.$inferSelect;

export async function createTask(task: InsertTask): Promise<SelectTask> {
  const [created] = await db.insert(tasks).values(task).returning();
  return created;
}

async function getTaskByProject(project: string): Promise<SelectTask | undefined> {
  const [task] = await db.select().from(tasks).where(eq(tasks.project, project)).limit(1);
  return task;
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
  return db.select().from(tasks).orderBy(asc(tasks.dueDate));
}
