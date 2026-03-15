import { SelectTask } from "@/lib/db/tasks";

export type HeaderNotificationsData = {
  notifications: TaskNotification[];
  overdueCount: number;
  nearlyExpiredCount: number;
  hasNotifications: boolean;
  badgeLabel: string;
};

export type TaskNotification = {
  id: string;
  title: string;
  project: string;
  dueDate: Date;
  priority: SelectTask["priority"];
  status: "overdue" | "nearlyExpired";
};
