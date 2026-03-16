import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TaskForm } from "@/components/task-form";
import styles from "@/components/task-form/styles.module.css";
import { getUserFromSession } from "@/lib/auth";
import { getTaskById } from "@/lib/db/tasks";

export const metadata: Metadata = {
  title: "Taskflow - Edit Task",
  description: "Update an existing task's details, due date, and priority.",
};

type EditTaskPageProps = {
  params: Promise<{
    taskId: string;
  }>;
};

function formatDueDate(value: Date) {
  return value.toISOString().slice(0, 10);
}

export default async function EditTaskPage({ params }: EditTaskPageProps) {
  const [{ taskId }, session] = await Promise.all([params, getUserFromSession()]);

  if (!session?.user) {
    notFound();
  }

  const task = await getTaskById(taskId);

  if (!task || task.userId !== session.user.id) {
    notFound();
  }

  return (
    <main className="animate-rise min-h-[calc(100vh-5rem)] px-2 md:px-6">
      <section className={styles.TaskForm_page}>
        <TaskForm
          mode="edit"
          taskId={task.id}
          projectCode={task.project}
          assigneeName={session.user.name ?? ""}
          initialValues={{
            title: task.title,
            description: task.description,
            dueDate: formatDueDate(task.dueDate),
            priority: task.priority,
            category: task.category,
          }}
        />
      </section>
    </main>
  );
}
