import { TaskNotification } from "@/components/header/constants";

export const TASK_CHECK_SCHEDULE = "*/10 * * * * *";
export const NEARLY_EXPIRED_HOURS = 24;

export function getOverdueAt(dueDate: Date) {
  const overdueAt = new Date(dueDate);
  return overdueAt;
}

export function getNearlyExpiredAt(dueDate: Date) {
  return new Date(getOverdueAt(dueDate).getTime() - NEARLY_EXPIRED_HOURS * 60 * 60 * 1000);
}

export function formatUtcDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(date);
}

export function isTaskOverdue(dueDate: Date, now = new Date()) {
  return now >= getOverdueAt(dueDate);
}

export function isTaskNearlyExpired(dueDate: Date, now = new Date()) {
  return now >= getNearlyExpiredAt(dueDate) && now < getOverdueAt(dueDate);
}

export function getTaskStatus(dueDate: Date, now = new Date()): TaskNotification["status"] | null {
  if (isTaskOverdue(dueDate, now)) {
    return "overdue";
  }

  if (isTaskNearlyExpired(dueDate, now)) {
    return "nearlyExpired";
  }

  return null;
}
