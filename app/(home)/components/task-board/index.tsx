"use client";

import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { BoardColumn, Priority } from "@/app/(home)/components/constants";
import styles from "./styles.module.css";
import { isExpired, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { getInitials } from "@/lib/utils";

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
  return (
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
                            styles.TaskBoard_cardTitleLinkDisabled,
                          )}
                          aria-disabled={true}
                          title="Only the assignee can edit this task"
                        >
                          [{task.project}] {task.title}
                        </span>
                      )}
                    </h3>
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
  );
}
