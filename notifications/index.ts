import cron from "node-cron";
import { getAllTasks, type SelectTask, updateTaskReminderStatus } from "@/lib/db/tasks";
import { TaskNotification } from "@/components/header/constants";
import {
  getTaskStatus,
  TASK_CHECK_SCHEDULE,
  NEARLY_EXPIRED_HOURS,
  getOverdueAt,
  formatUtcDate,
} from "./utils";

let isTaskMonitorStarted = false;

export function getTaskNotifications(
  tasks: SelectTask[],
  userId?: string,
  now = new Date(),
): TaskNotification[] {
  return tasks
    .flatMap<TaskNotification>((task) => {
      if (userId && task.userId !== userId) {
        return [];
      }

      const dueDate = new Date(task.dueDate);
      const status = getTaskStatus(dueDate, now);

      if (!status) {
        return [];
      }

      return {
        id: task.id,
        title: task.title,
        project: task.project,
        dueDate,
        priority: task.priority,
        status,
      };
    })
    .sort((left, right) => {
      if (left.status !== right.status) {
        return left.status === "overdue" ? -1 : 1;
      }

      return left.dueDate.getTime() - right.dueDate.getTime();
    });
}

async function checkTaskDeadlines() {
  try {
    const allTasks = await getAllTasks();
    const now = new Date();
    let overdueCount = 0; // Count of overdue tasks
    let nearlyExpiredCount = 0; // Count of nearly expired tasks
    let updatedReminderCount = 0; // Count of updated reminder statuses

    for (const item of allTasks) {
      const dueDate = new Date(item.dueDate);
      const overdueAt = getOverdueAt(dueDate);
      const status = getTaskStatus(dueDate, now);

      if (status === "overdue") {
        overdueCount += 1;
        if (await updateTaskReminderStatus(item.id, "overdue")) {
          updatedReminderCount += 1;
        }
        console.log(
          `[task-monitor] OVERDUE [${item.project}] ${item.title} | due: ${formatUtcDate(overdueAt)}`,
        );
        continue;
      }

      if (status === "nearlyExpired") {
        nearlyExpiredCount += 1;
        if (await updateTaskReminderStatus(item.id, "nearlyExpired")) {
          updatedReminderCount += 1;
        }
        console.log(
          `[task-monitor] NEARLY EXPIRED [${item.project}] ${item.title} | overdue in less than ${NEARLY_EXPIRED_HOURS} hours | due: ${formatUtcDate(overdueAt)}`,
        );
      }
    }

    console.log(
      `[task-monitor] tick | checked=${allTasks.length} overdue=${overdueCount} nearlyExpired=${nearlyExpiredCount} updated=${updatedReminderCount}`,
    );

    return {
      checked: allTasks.length,
      overdue: overdueCount,
      nearlyExpired: nearlyExpiredCount,
      updated: updatedReminderCount,
    };
  } catch (error) {
    console.error("[task-monitor] Failed to check task deadlines.", error);
    throw error;
  }
}

export async function runTaskDeadlineCheck() {
  return checkTaskDeadlines();
}

export function task() {
  if (isTaskMonitorStarted) {
    return;
  }

  isTaskMonitorStarted = true;
  console.log(`[task-monitor] started | schedule=${TASK_CHECK_SCHEDULE}`);

  cron.schedule(
    TASK_CHECK_SCHEDULE,
    () => {
      void runTaskDeadlineCheck();
    },
    { noOverlap: true },
  );

  void runTaskDeadlineCheck();
}
