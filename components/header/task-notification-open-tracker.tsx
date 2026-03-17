"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { markTaskNotificationOpenedAction } from "@/app/tasks/actions";

type TaskNotificationOpenTrackerProps = {
  taskId: string;
};

export function TaskNotificationOpenTracker({ taskId }: TaskNotificationOpenTrackerProps) {
  const hasTrackedRef = useRef(false);
  const router = useRouter();

  useEffect(() => {
    if (hasTrackedRef.current) {
      return;
    }

    hasTrackedRef.current = true;

    void (async () => {
      const didMarkOpened = await markTaskNotificationOpenedAction(taskId);

      if (didMarkOpened) {
        router.refresh();
      }
    })();
  }, [router, taskId]);

  return null;
}
