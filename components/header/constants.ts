import { SelectTask } from "@/lib/db/tasks";

export type HeaderNotificationsData = {
  notifications: TaskNotification[];
  overdueCount: number;
  nearlyExpiredCount: number;
  hasNotifications: boolean;
  hasUnreadNotifications: boolean;
  unreadCount: number;
  badgeLabel: string;
};

export const EMPTY_HEADER_NOTIFICATIONS: HeaderNotificationsData = {
  notifications: [],
  overdueCount: 0,
  nearlyExpiredCount: 0,
  hasNotifications: false,
  hasUnreadNotifications: false,
  unreadCount: 0,
  badgeLabel: "0",
};

export type TaskNotification = {
  id: string;
  title: string;
  project: string;
  dueDate: Date;
  priority: SelectTask["priority"];
  status: "overdue" | "nearlyExpired";
  href: string;
  isOpened: boolean;
};
