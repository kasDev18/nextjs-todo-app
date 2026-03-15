"use server";

import { getUserFromSession } from "@/lib/auth";
import { getAllTasks } from "@/lib/db/tasks";
import { getTaskNotifications } from "@/notifications";
import { HeaderNotificationsData } from "./constants";

export async function getHeaderNotifications(): Promise<HeaderNotificationsData> {
  const session = await getUserFromSession();

  if (!session || !session.user) {
    throw new Error("You must be signed in to view the header.");
  }

  const tasks = await getAllTasks();
  const notifications = getTaskNotifications(tasks);
  const overdueCount = notifications.filter((item) => item.status === "overdue").length;

  return {
    notifications,
    overdueCount,
    nearlyExpiredCount: notifications.length - overdueCount,
    hasNotifications: notifications.length > 0,
    badgeLabel: notifications.length > 9 ? "9+" : String(notifications.length),
  };
}
