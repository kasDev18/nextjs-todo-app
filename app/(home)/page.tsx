import type { BoardColumn } from "@/app/(home)/components/constants";
import { getTasksAction } from "@/app/(home)/actions";
import { TaskBoard } from "@/app/(home)/components/task-board";
import { COLUMNS } from "@/app/(home)/components/constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Taskflow - Task Board",
  description: "Track work across To Do, In Progress, and Done lanes with a focused task board.",
  icons: "/icon.svg",
};

export default async function HomePage() {
  const tasks = await getTasksAction();

  const columns: BoardColumn[] = COLUMNS.map(({ title, category }) => {
    const filtered = tasks
      .filter((t) => t.category === category)
      .map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        dueDate: t.dueDate.toISOString(),
        project: t.project,
        priority: t.priority,
      }));

    return { title, category, count: filtered.length, tasks: filtered };
  });

  return (
    <main className="animate-rise min-h-[calc(100vh-5rem)] px-2 md:px-6">
      <TaskBoard columns={columns} />
    </main>
  );
}
