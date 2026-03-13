"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { PlusIcon, XIcon } from "lucide-react";
import { createTaskSchema, type CreateTaskFormData } from "@/lib/validations/task";
import type { BoardColumn } from "@/app/(home)/components/constants";
import styles from "./styles.module.css";
import { createTaskAction } from "@/app/(home)/actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const CATEGORY_LABELS: Record<BoardColumn["category"], string> = {
  todo: "To Do",
  inProgress: "In Progress",
  done: "Done",
};

type CreateTaskDialogProps = {
  defaultCategory: BoardColumn["category"];
};

function getMinDueDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, "0");
  const day = String(tomorrow.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function CreateTaskDialog({ defaultCategory }: CreateTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const minDueDate = getMinDueDate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateTaskFormData>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      dueDate: "",
      priority: "medium",
      category: defaultCategory,
    },
  });

  async function onSubmit(data: CreateTaskFormData) {
    const result = await createTaskAction({
      title: data.title,
      description: data.description,
      dueDate: data.dueDate,
      priority: data.priority,
      category: defaultCategory,
    });

    if (!result.success) {
      toast.error("Failed to create task", { description: result.error });
      return;
    }

    toast.success("Task created", {
      description: "Task created successfully",
    });

    reset();
    setOpen(false);
    router.refresh();
  }

  const handleClose = () => {
    reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={styles.CTDialog_addTaskBtn}>
          <PlusIcon className="size-4" />
          <span className={styles.CTDialog_addTaskBtn_text}>Add Task</span>
        </Button>
      </DialogTrigger>

      <DialogContent showCloseButton={false} className={styles.CTDialog_cont}>
        {/* ── Header ── */}
        <div className={styles.CTDialog_header}>
          <div className={styles.CTDialog_headerLeft}>
            <DialogTitle asChild>
              <h2 className={styles.CTDialog_title}>Create Task</h2>
            </DialogTitle>
            <DialogDescription asChild>
              <p className={styles.CTDialog_subtitle}>Add a new task to the board</p>
            </DialogDescription>
          </div>
          <DialogClose asChild>
            <button
              type="button"
              className={styles.CTDialog_btnClose}
              aria-label="Close"
              onClick={handleClose}
            >
              <XIcon className="size-3.5" />
            </button>
          </DialogClose>
        </div>

        <div className={styles.CTDialog_divider} />

        {/* ── Body ── */}
        <form onSubmit={handleSubmit(onSubmit)} className={styles.CTDialog_body}>
          {/* Title */}
          <Field data-invalid={!!errors.title} className={styles.CTDialog_fieldTitleWrap}>
            <input
              className={styles.CTDialog_fieldTitle}
              type="text"
              placeholder="Task title..."
              aria-invalid={!!errors.title}
              {...register("title")}
            />
            <div className={styles.CTDialog_fieldTitleUl} />
            {errors.title && <FieldError className="mt-2">{errors.title.message}</FieldError>}
          </Field>

          {/* Description */}
          <Field data-invalid={!!errors.description} className="mb-5">
            <Textarea
              rows={3}
              className={styles.CTDialog_descInput}
              placeholder="Add a description — what needs to be done, any context or notes..."
              aria-invalid={!!errors.description}
              {...register("description")}
            />
            {errors.description && (
              <FieldError className="mt-1.5">{errors.description.message}</FieldError>
            )}
          </Field>

          {/* Section label */}
          <div className={styles.CTDialog_detailsText}>
            <span>Details</span>
          </div>

          {/* Meta grid */}
          <div className={styles.CTDialog_metaGrid}>
            {/* Priority */}
            <Field data-invalid={!!errors.priority} className={styles.CTDialog_metaField}>
              <FieldLabel className={styles.CTDialog_metaFieldText}>Priority</FieldLabel>
              <Select
                className={styles.CTDialog_select}
                aria-invalid={!!errors.priority}
                {...register("priority")}
              >
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🔴 High</option>
                <option value="critical">🔥 Critical</option>
              </Select>
              {errors.priority && <FieldError>{errors.priority.message}</FieldError>}
            </Field>

            {/* Due Date */}
            <Field data-invalid={!!errors.dueDate} className={styles.CTDialog_metaField}>
              <FieldLabel className={styles.CTDialog_metaFieldText}>Due Date</FieldLabel>
              <div className={styles.CTDialog_selectTrigger}>
                <input
                  type="date"
                  className={styles.CTDialog_dueDate}
                  aria-invalid={!!errors.dueDate}
                  min={minDueDate}
                  {...register("dueDate")}
                />
              </div>
              {errors.dueDate && <FieldError>{errors.dueDate.message}</FieldError>}
            </Field>

            {/* Column (auto-filled) */}
            <div className={styles.CTDialog_metaField}>
              <span className={styles.CTDialog_metaFieldText}>Column</span>
              <div className={styles.CTDialog_selectTrigger} aria-disabled={true}>
                <span
                  className={cn("cursor-not-allowed", styles.CTDialog_catBadge)}
                  data-category={defaultCategory}
                >
                  {CATEGORY_LABELS[defaultCategory]}
                </span>
              </div>
            </div>
          </div>

          {/* ── Footer ── */}
          <div className={styles.CTDialog_footer}>
            <DialogClose asChild>
              <button type="button" className={styles.CTDialog_btnCancel} onClick={handleClose}>
                Cancel
              </button>
            </DialogClose>
            <button type="submit" className={styles.CTDialog_btnCreate} disabled={isSubmitting}>
              <PlusIcon className="size-3.5" />
              {isSubmitting ? "Creating..." : "Create Task"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
