import type { Metadata } from "next";
import type { Category } from "@/app/(home)/components/constants";
import { TaskForm } from "@/components/task-form";
import styles from "@/components/task-form/styles.module.css";
import { getUserFromSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Taskflow - Create Task",
  description: "Create a new task and assign its due date, priority, and board column.",
};

const VALID_CATEGORIES: Category[] = ["todo", "inProgress", "done"];

function getDefaultCategory(category?: string): Category {
  if (category && VALID_CATEGORIES.includes(category as Category)) {
    return category as Category;
  }

  return "todo";
}

type CreateTaskPageProps = {
  searchParams?: Promise<{
    category?: string;
  }>;
};

export default async function CreateTaskPage({ searchParams }: CreateTaskPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const defaultCategory = getDefaultCategory(resolvedSearchParams?.category);
  const session = await getUserFromSession();
  const assigneeName = session?.user?.name ?? "";

  return (
    <main className="animate-rise min-h-[calc(100vh-5rem)] px-2 md:px-6">
      <section className={styles.TaskForm_page}>
        <TaskForm
          mode="create"
          assigneeName={assigneeName}
          initialValues={{
            title: "",
            description: "",
            dueDate: "",
            priority: "medium",
            category: defaultCategory,
          }}
        />
      </section>
    </main>
  );
}
