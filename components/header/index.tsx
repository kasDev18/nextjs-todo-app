import styles from "./styles.module.css";
import { ThemeToggle } from "../ThemeToggle";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";
import { BellIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { shortUtcDateFormatter } from "@/lib/formatters";
import { getTasksByUserIdWithReminderStatus } from "@/lib/db/tasks";
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

export default async function Header() {
  const session = await getUserFromSession();
  let headerNotifications: HeaderNotificationsData = EMPTY_HEADER_NOTIFICATIONS;

  if (session?.user) {
    try {
      const tasks = await getTasksByUserIdWithReminderStatus(session.user.id);
      const notifications = getTaskNotifications(tasks, session.user.id);
      const unreadNotifications = notifications.filter((item) => !item.isOpened);
      const overdueCount = unreadNotifications.filter((item) => item.status === "overdue").length;

      headerNotifications = {
        notifications,
        overdueCount,
        nearlyExpiredCount: unreadNotifications.length - overdueCount,
        hasNotifications: notifications.length > 0,
        hasUnreadNotifications: unreadNotifications.length > 0,
        unreadCount: unreadNotifications.length,
        badgeLabel: unreadNotifications.length > 9 ? "9+" : String(unreadNotifications.length),
      };
    } catch (error) {
      console.error("Failed to load header notifications:", error);
    }
  }

  const {
    notifications,
    overdueCount,
    nearlyExpiredCount,
    hasNotifications,
    hasUnreadNotifications,
    unreadCount,
    badgeLabel,
  } = headerNotifications;

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
                {hasUnreadNotifications ? (
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
                    {hasUnreadNotifications
                      ? `${overdueCount} overdue, ${nearlyExpiredCount} due soon`
                      : hasNotifications
                        ? "All urgent notifications have been opened"
                        : "No urgent deadlines right now"}
                  </p>
                </div>
                {hasNotifications ? (
                  <span className={styles.Header_ddUrgent}>
                    {hasUnreadNotifications ? `${unreadCount} unread` : "All opened"}
                  </span>
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
                      <Link
                        key={notification.id}
                        href={notification.href}
                        className={cn(
                          styles.Header_ddItem,
                          notification.isOpened && styles.Header_ddItemOpened,
                        )}
                      >
                        <div className={styles.Header_ddItemHeader}>
                          <span className={cn(styles.Header_ddItemStatus, statusStyles)}>
                            {notification.status === "overdue" ? "Overdue" : "Due soon"}
                          </span>
                          <div className={styles.Header_ddItemMeta}>
                            {notification.isOpened ? (
                              <span className={styles.Header_ddItemOpenedLabel}>Opened</span>
                            ) : (
                              <span className={styles.Header_ddItemUnreadDot} aria-hidden="true" />
                            )}
                            <span className={styles.Header_ddItemProj}>{notification.project}</span>
                          </div>
                        </div>
                        <p className={styles.Header_ddItemTitle}>{notification.title}</p>
                        <p className={styles.Header_ddItemDesc}>
                          {notification.status === "overdue"
                            ? `Deadline passed on ${shortUtcDateFormatter.format(notification.dueDate)}`
                            : `Due by ${shortUtcDateFormatter.format(notification.dueDate)}`}
                        </p>
                      </Link>
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
