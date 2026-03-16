"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type DragEvent } from "react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  CATEGORY_LABELS,
  type BoardColumn,
  type Category,
  type Priority,
  type Task,
} from "@/app/(home)/components/constants";
import styles from "./styles.module.css";
import { isExpired, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { EllipsisIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { getInitials } from "@/lib/utils";
import { deleteTaskAction, moveTaskAction } from "@/app/tasks/actions";
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

type DragState = {
  taskId: string;
  fromCategory: Category;
  taskTitle: string;
};

function syncColumnCounts(columns: BoardColumn[]): BoardColumn[] {
  return columns.map((column) => ({
    ...column,
    count: column.tasks.length,
  }));
}

function moveTaskBetweenColumns(
  columns: BoardColumn[],
  taskId: string,
  targetCategory: Category,
): BoardColumn[] {
  let movedTask: Task | null = null;
  let sourceCategory: Category | null = null;

  const nextColumns = columns.map((column) => {
    const taskIndex = column.tasks.findIndex((task) => task.id === taskId);

    if (taskIndex === -1) {
      return column;
    }

    movedTask = column.tasks[taskIndex] ?? null;
    sourceCategory = column.category;

    return {
      ...column,
      tasks: column.tasks.filter((task) => task.id !== taskId),
    };
  });

  if (!movedTask || !sourceCategory || sourceCategory === targetCategory) {
    return columns;
  }

  const taskToMove = movedTask;

  return syncColumnCounts(
    nextColumns.map((column) =>
      column.category === targetCategory
        ? {
            ...column,
            tasks: [...column.tasks, taskToMove],
          }
        : column,
    ),
  );
}

export function TaskBoard({ columns }: TaskBoardProps) {
  const router = useRouter();
  const [boardColumns, setBoardColumns] = useState(columns);
  const [taskToDelete, setTaskToDelete] = useState<DeleteTaskDialogTask | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [dropTargetCategory, setDropTargetCategory] = useState<Category | null>(null);
  const [pendingMoveTaskId, setPendingMoveTaskId] = useState<string | null>(null);
  const [dragMessage, setDragMessage] = useState("Drag an editable task to another column.");

  useEffect(() => {
    setBoardColumns(columns);
  }, [columns]);

  function clearDragState() {
    setDragState(null);
    setDropTargetCategory(null);
    setDragMessage("Drag an editable task to another column.");
  }

  function handleDragStart(event: DragEvent<HTMLElement>, task: Task, fromCategory: Category) {
    if (!task.canEdit || pendingMoveTaskId) {
      event.preventDefault();
      return;
    }

    event.dataTransfer.effectAllowed = "move";

    setDragState({
      taskId: task.id,
      fromCategory,
      taskTitle: task.title,
    });
    setDropTargetCategory(null);
    setDragMessage(`Dragging ${task.title}. Drop in another column to move it.`);
  }

  function handleDragOver(event: DragEvent<HTMLElement>, category: Category) {
    if (!dragState || dragState.fromCategory === category || pendingMoveTaskId) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";

    if (dropTargetCategory !== category) {
      setDropTargetCategory(category);
      setDragMessage(`Drop in ${CATEGORY_LABELS[category]} to move ${dragState.taskTitle}.`);
    }
  }

  function handleDragLeave(event: DragEvent<HTMLElement>, category: Category) {
    if (dropTargetCategory !== category) {
      return;
    }

    const nextTarget = event.relatedTarget;

    if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) {
      return;
    }

    setDropTargetCategory(null);
    setDragMessage(
      `Dragging ${dragState?.taskTitle ?? "task"}. Drop in another column to move it.`,
    );
  }

  async function handleDrop(event: DragEvent<HTMLElement>, targetCategory: Category) {
    event.preventDefault();

    if (!dragState || dragState.fromCategory === targetCategory || pendingMoveTaskId) {
      clearDragState();
      return;
    }

    const previousColumns = boardColumns;
    const optimisticColumns = moveTaskBetweenColumns(
      boardColumns,
      dragState.taskId,
      targetCategory,
    );

    if (optimisticColumns === boardColumns) {
      clearDragState();
      return;
    }

    setBoardColumns(optimisticColumns);
    setPendingMoveTaskId(dragState.taskId);
    clearDragState();

    try {
      const result = await moveTaskAction(dragState.taskId, targetCategory);

      if (!result.success) {
        setBoardColumns(previousColumns);
        toast.error(result.error);
        return;
      }

      toast.success(`Task moved to ${CATEGORY_LABELS[targetCategory]}`);
      router.refresh();
    } catch (error) {
      console.error("Failed to move task:", error);
      setBoardColumns(previousColumns);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setPendingMoveTaskId(null);
    }
  }

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
      <p id="task-board-instructions" className="sr-only">
        {dragMessage}
      </p>

      <section
        className={styles.TaskBoard}
        aria-label="Task board columns"
        aria-describedby="task-board-instructions"
      >
        {boardColumns.map((column) => (
          <article
            key={column.category}
            className={cn(
              styles.TaskBoard_col,
              dropTargetCategory === column.category && styles.TaskBoard_col___dropTarget,
            )}
            onDragOver={(event) => handleDragOver(event, column.category)}
            onDragLeave={(event) => handleDragLeave(event, column.category)}
            onDrop={(event) => handleDrop(event, column.category)}
          >
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
                    <article
                      key={task.id}
                      className={cn(
                        styles.TaskBoard_card,
                        task.canEdit && styles.TaskBoard_card___draggable,
                        dragState?.taskId === task.id && styles.TaskBoard_card___dragging,
                        pendingMoveTaskId === task.id && styles.TaskBoard_card___pending,
                      )}
                      draggable={task.canEdit && pendingMoveTaskId === null}
                      onDragStart={(event) => handleDragStart(event, task, column.category)}
                      onDragEnd={clearDragState}
                      aria-busy={pendingMoveTaskId === task.id}
                    >
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
