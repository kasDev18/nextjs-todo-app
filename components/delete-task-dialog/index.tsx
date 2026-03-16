"use client";

import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { shortUtcDateWithYearFormatter } from "@/lib/formatters";
import { getInitials } from "@/lib/utils";
import styles from "./styles.module.css";
import { type DeleteTaskDialogProps } from "./constants";
export type { DeleteTaskDialogTask } from "./constants";

export function DeleteTaskDialog({
  open,
  onOpenChange,
  onConfirm,
  isDeleting = false,
  task,
}: DeleteTaskDialogProps) {
  const [confirmationText, setConfirmationText] = useState("");
  const canDelete = confirmationText === "DELETE" && !isDeleting;
  const assignee = useMemo(
    () => (task ? getInitials(task.assigneeName) : { initials: "", color: "hsl(342, 65%, 45%)" }),
    [task],
  );

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setConfirmationText("");
    }

    onOpenChange(nextOpen);
  }

  async function handleConfirm() {
    if (!canDelete) {
      return;
    }

    const didDelete = await onConfirm();

    if (didDelete) {
      setConfirmationText("");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className={styles.Dtd_content}>
        <div className={styles.Dtd_wrap} />

        <DialogHeader className={styles.Dtd_header}>
          <DialogTitle className={styles.Dtd_title}>Delete this task?</DialogTitle>
          <DialogDescription className={styles.Dtd_description}>
            This action is permanent and cannot be reversed. Please review the details below before
            proceeding.
          </DialogDescription>
        </DialogHeader>

        {task ? (
          <div className={styles.Dtd_preview}>
            <div className={styles.Dtd_previewTop}>
              <span className={styles.Dtd_project}>{task.project}</span>
              <span className={styles.Dtd_status}>{task.statusLabel}</span>
            </div>
            <p className={styles.Dtd_taskTitle}>{task.title}</p>
            <div className={styles.Dtd_meta}>
              <span
                className={styles.Dtd_assignee}
                style={{ backgroundColor: assignee.color, borderColor: assignee.color }}
                aria-label={`Assignee: ${task.assigneeName}`}
                title={task.assigneeName}
              >
                {assignee.initials}
              </span>
              <span className={styles.Dtd_assigneeName}>{task.assigneeName}</span>
              <span className={styles.Dtd_metaDot} />
              <span>{shortUtcDateWithYearFormatter.format(new Date(task.dueDate))}</span>
            </div>
          </div>
        ) : null}

        <div className={styles.Dtd_confirmBlock}>
          <p className={styles.Dtd_confirmLabel}>
            Type <span>DELETE</span> to confirm
          </p>
          <input
            type="text"
            value={confirmationText}
            onChange={(event) => setConfirmationText(event.target.value)}
            placeholder="Type DELETE to enable the button"
            className={styles.Dtd_input}
            disabled={isDeleting}
          />
        </div>

        <DialogFooter className={styles.Dtd_footer}>
          <Button
            type="button"
            variant="outline"
            className={styles.Dtd_keepBtn}
            onClick={() => handleOpenChange(false)}
            disabled={isDeleting}
          >
            Keep task
          </Button>
          <Button
            type="button"
            variant="destructive"
            className={styles.Dtd_deleteBtn}
            onClick={handleConfirm}
            disabled={!canDelete}
          >
            {isDeleting ? "Deleting..." : "Delete permanently"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
