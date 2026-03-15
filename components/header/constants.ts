import { SelectTask } from "@/lib/db/tasks";

export type HeaderNotificationsData = {
  notifications: TaskNotification[];
  overdueCount: number;
  nearlyExpiredCount: number;
  hasNotifications: boolean;
  badgeLabel: string;
};

export const EMPTY_HEADER_NOTIFICATIONS: HeaderNotificationsData = {
  notifications: [],
  overdueCount: 0,
  nearlyExpiredCount: 0,
  hasNotifications: false,
  badgeLabel: "0",
};

export type TaskNotification = {
  id: string;
  title: string;
  project: string;
  dueDate: Date;
  priority: SelectTask["priority"];
  status: "overdue" | "nearlyExpired";
};
