import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { TaskForm } from "@/components/task-form";
import { TaskNotificationOpenTracker } from "@/components/header/task-notification-open-tracker";
import { Button } from "@/components/ui/button";
import styles from "./styles.module.css";
import { getUserFromSession } from "@/lib/auth";
import { getTaskByIdWithReminder } from "@/lib/db/tasks";
import { cn } from "@/lib/utils";
import { getTaskStatus } from "@/notifications/utils";

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

type TaskReminderAccessStateProps = {
  title: string;
  description: string;
  secondaryHref?: string;
  secondaryLabel?: string;
};

function TaskReminderAccessState({
  title,
  description,
  secondaryHref = "/",
  secondaryLabel = "Go to dashboard",
}: TaskReminderAccessStateProps) {
  return (
    <main className={cn("animate-rise", styles.EditTask)}>
      <section className={styles.EditTask_TRAS}>
        <div className={styles.EditTask_TRASWrapper}>
          <div className={styles.EditTask_TRASHeader}>Creator-only task access</div>
          <h1 className={styles.EditTask_TRASTitle}>{title}</h1>
          <p className={styles.EditTask_TRASDesc}>{description}</p>
          <Button asChild size="lg" variant="outline" className={styles.EditTask_TRASBtn}>
            <Link href={secondaryHref}>{secondaryLabel}</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}

export default async function EditTaskPage({ params }: EditTaskPageProps) {
  const [{ taskId }, session] = await Promise.all([params, getUserFromSession()]);
  const taskHref = `/tasks/${taskId}/edit`;

  if (!session?.user) {
    redirect(`/signin?redirectTo=${encodeURIComponent(taskHref)}`);
  }

  const task = await getTaskByIdWithReminder(taskId);

  if (!task) {
    return (
      <TaskReminderAccessState
        title="This task link is no longer available"
        description="The task may have been deleted, moved, or the reminder link is no longer valid."
      />
    );
  }

  if (task.userId !== session.user.id) {
    return (
      <TaskReminderAccessState
        title="Only the task creator can open this page"
        description="This reminder link is tied to the account that created the task. Sign in with the creator account to view the task details or make changes."
      />
    );
  }

  const reminderStatus = getTaskStatus(new Date(task.dueDate));
  const shouldTrackNotificationOpen = Boolean(reminderStatus && !task.reminder?.isOpened);

  return (
    <main className={cn("animate-rise", styles.EditTask)}>
      {shouldTrackNotificationOpen ? <TaskNotificationOpenTracker taskId={task.id} /> : null}
      <section className={styles.EditTask_form}>
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
