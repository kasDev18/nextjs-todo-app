import { categoryEnum, priorityEnum } from "@/lib/db/schema";
import type { SelectTask } from "@/lib/db/tasks";

export type Category = (typeof categoryEnum.enumValues)[number];
export type Priority = (typeof priorityEnum.enumValues)[number];

export type CreateTaskResult =
  | { success: true; task: SelectTask }
  | { success: false; error: string };

export const COLUMNS: Pick<BoardColumn, "title" | "category">[] = [
  { title: "To Do", category: "todo" },
  { title: "In Progress", category: "inProgress" },
  { title: "Done", category: "done" },
];

export type BoardColumn = {
  title: string;
  category: Category;
  count: number;
  tasks: Task[];
};

export type Task = {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  project: string;
  priority: Priority;
  assigneeLabel: string;
};
