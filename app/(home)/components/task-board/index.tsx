"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { BoardColumn, Priority } from "@/app/(home)/components/constants";
import styles from "./styles.module.css";
import { isExpired, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { EllipsisIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { getInitials } from "@/lib/utils";
import { deleteTaskAction } from "@/app/tasks/actions";
import { DeleteTaskDialog, type DeleteTaskDialogTask } from "@/components/delete-task-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type TaskBoardProps = {
  columns: BoardColumn[];
};

const PRIORITY_LABELS: Record<Priority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

export function TaskBoard({ columns }: TaskBoardProps) {
  const router = useRouter();
  const [taskToDelete, setTaskToDelete] = useState<DeleteTaskDialogTask | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDeleteTask(): Promise<boolean> {
    if (!taskToDelete) {
      return false;
    }

    setIsDeleting(true);

    try {
      const result = await deleteTaskAction(taskToDelete.id);

      if (!result.success) {
        console.error("Failed to delete task:", result.error);
        toast.error(result.error);
        return false;
      }

      setTaskToDelete(null);
      toast.success("Task deleted successfully");
      router.refresh();
      return true;
    } catch (error) {
      console.error("Failed to delete task:", error);
      toast.error("Something went wrong. Please try again.");
      return false;
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <section className={styles.TaskBoard} aria-label="Task board columns">
        {columns.map((column) => (
          <article key={column.category} className={styles.TaskBoard_col}>
            <div className={styles.TaskBoard_colHeader}>
              <div className={styles.TaskBoard_titleRow} data-category={column.category}>
                <h2 className={styles.TaskBoard_title} data-category={column.category}>
                  {column.title}
                </h2>
              </div>

              <span className={styles.TaskBoard_colCount}>{column.count}</span>
            </div>
            <Separator className={styles.TaskBoard_separator} />

            <ScrollArea className={styles.TaskBoard_task}>
              <div className={styles.TaskBoard_taskList}>
                {column.tasks.map((task) => {
                  const dueDate = new Date(task.dueDate);
                  const isOverdue = isExpired(dueDate);
                  const dueDateLabel = dueDate.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    timeZone: "UTC",
                  });
                  const { initials, color } = getInitials(task.assigneeLabel);

                  return (
                    <article key={task.id} className={styles.TaskBoard_card}>
                      <div className={styles.TaskBoard_cardHeader}>
                        <h3 className={styles.TaskBoard_cardTitle}>
                          {task.canEdit ? (
                            <Link
                              href={`/tasks/${task.id}/edit`}
                              className={styles.TaskBoard_cardTitleLink}
                            >
                              [{task.project}] {task.title}
                            </Link>
                          ) : (
                            <span
                              className={cn(
                                styles.TaskBoard_cardTitleLink,
                                styles.TaskBoard_cardTitleLink___disabled,
                              )}
                              aria-disabled={true}
                              title="Only the assignee can edit this task"
                            >
                              [{task.project}] {task.title}
                            </span>
                          )}
                        </h3>
                        {task.canEdit ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                className={styles.TaskBoard_cardMenuTrigger}
                                aria-label={`Open actions for ${task.title}`}
                              >
                                <EllipsisIcon />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className={styles.TaskBoard_cardMenuCont}
                            >
                              <DropdownMenuItem
                                onSelect={() => router.push(`/tasks/${task.id}/edit`)}
                              >
                                <PencilIcon />
                                Edit task
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                variant="destructive"
                                onSelect={() =>
                                  setTaskToDelete({
                                    id: task.id,
                                    title: task.title,
                                    project: task.project,
                                    dueDate: task.dueDate,
                                    assigneeName: task.assigneeLabel,
                                    statusLabel: column.title,
                                  })
                                }
                              >
                                <Trash2Icon />
                                Delete task
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : null}
                      </div>
                      <p className={styles.TaskBoard_cardDesc}>{task.description}</p>

                      <div className={styles.TaskBoard_cardFooter}>
                        <div className={styles.TaskBoard_cardMeta}>
                          <span
                            className={styles.TaskBoard_cardAssignee}
                            aria-label={`Assignee: ${task.assigneeLabel}`}
                            title={task.assigneeLabel}
                            style={{ backgroundColor: color, borderColor: color }}
                          >
                            {initials}
                          </span>
                          <span
                            className={styles.TaskBoard_cardPrio}
                            data-priority={task.priority}
                            aria-label={`Priority: ${PRIORITY_LABELS[task.priority]}`}
                          >
                            {PRIORITY_LABELS[task.priority]}
                          </span>
                        </div>
                        <span
                          className={cn(
                            styles.TaskBoard_taskExpDate,
                            isOverdue ? "text-red-500 dark:text-red-400" : "text-muted",
                          )}
                        >
                          {dueDateLabel}
                        </span>
                      </div>
                    </article>
                  );
                })}

                <Button asChild className={styles.TaskForm_addTaskButton}>
                  <Link href={`/tasks/new?category=${column.category}`}>
                    <PlusIcon />
                    <span className={styles.TaskForm_addTaskText}>Add Task</span>
                  </Link>
                </Button>
              </div>
            </ScrollArea>
          </article>
        ))}
      </section>

      <DeleteTaskDialog
        open={Boolean(taskToDelete)}
        onOpenChange={(open) => !open && setTaskToDelete(null)}
        onConfirm={handleDeleteTask}
        isDeleting={isDeleting}
        task={taskToDelete}
      />
    </>
  );
}
