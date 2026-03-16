import cron from "node-cron";
import {
  getAllTasksWithReminderStatus,
  syncTaskReminderStatus,
  type SelectTask,
} from "@/lib/db/tasks";
import { TaskNotification } from "@/components/header/constants";
import {
  getTaskStatus,
  TASK_CHECK_SCHEDULE,
  NEARLY_EXPIRED_HOURS,
  getOverdueAt,
  formatUtcDate,
} from "./utils";

let isTaskMonitorStarted = false;

/*
  Gets the task notifications for a given set of tasks.
  @param tasks - The tasks to get the notifications for.
  @param userId - The ID of the user to get the notifications for.
  @param now - The current date and time.
  @returns The task notifications.
*/
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

/*
  Checks the task deadlines for a given set of tasks.
  @returns The task deadline check results.
*/
async function checkTaskDeadlines() {
  try {
    const allTasks = await getAllTasksWithReminderStatus();
    const now = new Date();
    let overdueCount = 0; // Count of overdue tasks
    let nearlyExpiredCount = 0; // Count of nearly expired tasks
    let updatedReminderCount = 0; // Count of updated reminder statuses

    for (const item of allTasks) {
      const dueDate = new Date(item.dueDate);
      const overdueAt = getOverdueAt(dueDate);
      const status = getTaskStatus(dueDate, now);
      const didUpdateReminder = status
        ? await syncTaskReminderStatus(item.id, status, item.reminder)
        : false;

      if (status === "overdue") {
        overdueCount += 1;
        if (didUpdateReminder) {
          updatedReminderCount += 1;
        }
        console.log(
          `[task-monitor] OVERDUE [${item.project}] ${item.title} | due: ${formatUtcDate(overdueAt)}`,
        );
        continue;
      }

      if (status === "nearlyExpired") {
        nearlyExpiredCount += 1;
        if (didUpdateReminder) {
          updatedReminderCount += 1;
        }
        console.log(
          `[task-monitor] NEARLY EXPIRED [${item.project}] ${item.title} | overdue in less than ${NEARLY_EXPIRED_HOURS} hours | due: ${formatUtcDate(overdueAt)}`,
        );
        continue;
      }

      if (didUpdateReminder) {
        updatedReminderCount += 1;
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

/*
  Runs the task deadline check.
  This function is called by the cron job to check the task deadlines.
  @returns The task deadline check results.
*/
export async function runTaskDeadlineCheck() {
  return checkTaskDeadlines();
}

/*
  Starts the task deadline check.
  This function is called by the cron job to start the task deadline check.
*/
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
