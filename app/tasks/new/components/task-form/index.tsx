"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { PlusIcon } from "lucide-react";
import { createTaskSchema, type CreateTaskFormData } from "@/lib/validations/task";
import styles from "./styles.module.css";
import { createTaskAction } from "@/app/(home)/actions";
import { toast } from "sonner";
import { cn, getMinDueDate } from "@/lib/utils";
import { CATEGORY_LABELS } from "../constants";
import type { TaskFormProps } from "../constants";

export function TaskForm({ defaultCategory, assigneeName }: TaskFormProps) {
  const router = useRouter();
  const minDueDate = getMinDueDate();

  const {
    register,
    handleSubmit,
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
      console.error("Failed to create task:", result.error);
      toast.error("Failed to create task");
      return;
    }

    toast.success("Task created successfully");

    router.push("/");
    router.refresh();
  }

  const handleCancel = () => {
    router.push("/");
  };

  return (
    <div className={styles.TaskForm_card}>
      <div className={styles.TaskForm_header}>
        <div className={styles.TaskForm_headerLeft}>
          <div>
            <span className={"text-xs text-blue-500"}>+ Add Task</span>
          </div>
          <h2 className={styles.TaskForm_title}>What needs to get done?</h2>
          <p className={styles.TaskForm_subtitle}>
            Fill in the details below — at minimum a title and description will get you started.
          </p>
        </div>
      </div>

      <div className={styles.TaskForm_divider} />

      <form onSubmit={handleSubmit(onSubmit)} className={styles.TaskForm_body}>
        <Field data-invalid={!!errors.title} className={styles.TaskForm_titleField}>
          <input
            className={styles.TaskForm_titleInput}
            type="text"
            placeholder="Task title..."
            aria-invalid={!!errors.title}
            {...register("title")}
          />
          <div className={styles.TaskForm_titleUl} />
          {errors.title && <FieldError className="mt-2">{errors.title.message}</FieldError>}
        </Field>

        <Field data-invalid={!!errors.description} className="mb-5">
          <Textarea
            rows={3}
            className={styles.TaskForm_descInput}
            placeholder="Add a description — what needs to be done, any context or notes..."
            aria-invalid={!!errors.description}
            {...register("description")}
          />
          {errors.description && (
            <FieldError className="mt-1.5">{errors.description.message}</FieldError>
          )}
        </Field>

        <div className={styles.TaskForm_detailsLabel}>
          <span>Details</span>
        </div>

        <div className={styles.TaskForm_metaGrid}>
          <Field data-invalid={!!errors.priority} className={styles.TaskForm_metaField}>
            <FieldLabel className={styles.TaskForm_metaFieldText}>Priority</FieldLabel>
            <Select
              className={styles.TaskForm_select}
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

          <Field data-invalid={!!errors.dueDate} className={styles.TaskForm_metaField}>
            <FieldLabel className={styles.TaskForm_metaFieldText}>Due Date</FieldLabel>
            <div className={styles.TaskForm_inputShell}>
              <input
                type="date"
                className={styles.TaskForm_dueDate}
                aria-invalid={!!errors.dueDate}
                min={minDueDate}
                {...register("dueDate")}
              />
            </div>
            {errors.dueDate && <FieldError>{errors.dueDate.message}</FieldError>}
          </Field>

          <div className={styles.TaskForm_metaField}>
            <span className={styles.TaskForm_metaFieldText}>Column</span>
            <div className={styles.TaskForm_inputShell} aria-disabled={true}>
              <span
                className={cn("cursor-not-allowed", styles.TaskForm_catBadge)}
                data-category={defaultCategory}
              >
                {CATEGORY_LABELS[defaultCategory]}
              </span>
            </div>
          </div>

          <div className={styles.TaskForm_metaField}>
            <span className={styles.TaskForm_metaFieldText}>Assignee</span>
            <div
              className={cn(styles.TaskForm_inputShell, "cursor-not-allowed")}
              aria-disabled={true}
            >
              <span className={styles.TaskForm_assigneeName}>{assigneeName}</span>
            </div>
          </div>
        </div>
        <div className={styles.TaskForm_footer}>
          <button type="button" className={styles.TaskForm_cancelBtn} onClick={handleCancel}>
            Cancel
          </button>
          <button type="submit" className={styles.TaskForm_submitBtn} disabled={isSubmitting}>
            <PlusIcon className="size-3.5" />
            {isSubmitting ? "Creating..." : "Create Task"}
          </button>
        </div>
      </form>
    </div>
  );
}
