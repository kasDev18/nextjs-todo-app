import styles from "./styles.module.css";
import { ThemeToggle } from "../ThemeToggle";
import Image from "next/image";
import { Button } from "../ui/button";
import { BellIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { getTasksByUserId } from "@/lib/db/tasks";
import { getTaskNotifications } from "@/notifications";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "../ui/dropdown-menu";
import { getUserFromSession } from "@/lib/auth";
import { EMPTY_HEADER_NOTIFICATIONS, type HeaderNotificationsData } from "./constants";

const dueDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

export default async function Header() {
  const session = await getUserFromSession();
  let headerNotifications: HeaderNotificationsData = EMPTY_HEADER_NOTIFICATIONS;

  if (session?.user) {
    try {
      const tasks = await getTasksByUserId(session.user.id);
      const notifications = getTaskNotifications(tasks, session.user.id);
      const overdueCount = notifications.filter((item) => item.status === "overdue").length;

      headerNotifications = {
        notifications,
        overdueCount,
        nearlyExpiredCount: notifications.length - overdueCount,
        hasNotifications: notifications.length > 0,
        badgeLabel: notifications.length > 9 ? "9+" : String(notifications.length),
      };
    } catch (error) {
      console.error("Failed to load header notifications:", error);
    }
  }

  const { notifications, overdueCount, nearlyExpiredCount, hasNotifications, badgeLabel } =
    headerNotifications;

  return (
    <div className={styles.Header}>
      <div className={styles.Header_logo}>
        <div className={styles.Header_logoIcon}>
          <Image src="/icon.svg" alt="Taskflow" width={24} height={24} />
        </div>
        <span className={styles.Header_logoName}>Taskflow</span>
      </div>
      <div className={styles.Header_dd}>
        {session && session.user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="relative">
              <Button variant="ghost" size="icon" className={styles.Header_ddBtn}>
                {hasNotifications ? (
                  <div className={styles.Header_ddNotifBadge}>
                    <span className={styles.Header_ddNotifBadge_label}>{badgeLabel}</span>
                  </div>
                ) : null}
                <BellIcon className="size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className={styles.Header_ddCont} align="start">
              <DropdownMenuLabel className={styles.Header_ddLabel}>
                <div className="space-y-1">
                  <p className={styles.Header_ddTitle}>Notifications</p>
                  <p className={styles.Header_ddDesc}>
                    {hasNotifications
                      ? `${overdueCount} overdue, ${nearlyExpiredCount} due soon`
                      : "No urgent deadlines right now"}
                  </p>
                </div>
                {hasNotifications ? (
                  <span className={styles.Header_ddUrgent}>{notifications.length} urgent</span>
                ) : null}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {hasNotifications ? (
                <div className={styles.Header_ddList}>
                  {notifications.map((notification) => {
                    const statusStyles =
                      notification.status === "overdue"
                        ? styles.Header_ddOverdue
                        : styles.Header_ddDueSoon;

                    return (
                      <div key={notification.id} className={styles.Header_ddItem}>
                        <div className={styles.Header_ddItemHeader}>
                          <span className={cn(styles.Header_ddItemStatus, statusStyles)}>
                            {notification.status === "overdue" ? "Overdue" : "Due soon"}
                          </span>
                          <span className={styles.Header_ddItemProj}>{notification.project}</span>
                        </div>
                        <p className={styles.Header_ddItemTitle}>{notification.title}</p>
                        <p className={styles.Header_ddItemDesc}>
                          {notification.status === "overdue"
                            ? `Deadline passed on ${dueDateFormatter.format(notification.dueDate)}`
                            : `Due by ${dueDateFormatter.format(notification.dueDate)}`}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className={styles.Header_ddEmpty}>
                  <p className={styles.Header_ddEmptyTitle}>All caught up</p>
                  <p className={styles.Header_ddEmptyDesc}>
                    Overdue and nearly expired tasks will appear here.
                  </p>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <ThemeToggle />
      </div>
    </div>
  );
}
