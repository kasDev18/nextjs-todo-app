"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createTaskAction, deleteTaskAction, updateTaskAction } from "@/app/tasks/actions";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DeleteTaskDialog } from "@/components/delete-task-dialog";
import { cn, getMinDueDate } from "@/lib/utils";
import { createTaskSchema, type CreateTaskFormData } from "@/lib/validations/task";
import { CATEGORY_LABELS, type TaskFormProps } from "./constants";
import styles from "./styles.module.css";

const TASK_DRAFT_STORAGE_KEY_PREFIX = "taskflow:create-task-draft:";

type DraftSaveState = "idle" | "restored" | "saving" | "saved";

function getTaskDraftStorageKey(category: CreateTaskFormData["category"]) {
  return `${TASK_DRAFT_STORAGE_KEY_PREFIX}${category}`;
}

function isStoredTaskDraft(value: unknown): value is CreateTaskFormData {
  if (!value || typeof value !== "object") {
    return false;
  }

  const draft = value as Partial<Record<keyof CreateTaskFormData, unknown>>;

  return (
    typeof draft.title === "string" &&
    typeof draft.description === "string" &&
    typeof draft.dueDate === "string" &&
    (draft.priority === "low" ||
      draft.priority === "medium" ||
      draft.priority === "high" ||
      draft.priority === "critical") &&
    (draft.category === "todo" || draft.category === "inProgress" || draft.category === "done")
  );
}

function areTaskValuesEqual(left: CreateTaskFormData, right: CreateTaskFormData) {
  return (
    left.title === right.title &&
    left.description === right.description &&
    left.dueDate === right.dueDate &&
    left.priority === right.priority &&
    left.category === right.category
  );
}

export function TaskForm({
  mode,
  assigneeName,
  taskId,
  projectCode,
  initialValues,
}: TaskFormProps) {
  const router = useRouter();
  const minDueDate = getMinDueDate();
  const isEditMode = mode === "edit";
  const isCreateMode = mode === "create";
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [draftSaveState, setDraftSaveState] = useState<DraftSaveState>("idle");
  const [lastDraftSavedAt, setLastDraftSavedAt] = useState<string | null>(null);
  const hasLoadedDraftRef = useRef(false);

  const defaultCreateValues = useMemo<CreateTaskFormData>(
    () => ({
      title: "",
      description: "",
      dueDate: "",
      priority: "medium",
      category: initialValues.category,
    }),
    [initialValues.category],
  );

  const draftStorageKey = useMemo(
    () => getTaskDraftStorageKey(initialValues.category),
    [initialValues.category],
  );

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateTaskFormData>({
    // Work around a known zodResolver typing bug with zod 4.3.x on clean installs.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createTaskSchema as any),
    defaultValues: initialValues,
  });

  const [title, description, dueDate, priority] = watch([
    "title",
    "description",
    "dueDate",
    "priority",
  ]);

  useEffect(() => {
    if (!isCreateMode) {
      return;
    }

    try {
      const storedDraft = window.localStorage.getItem(draftStorageKey);

      if (!storedDraft) {
        setDraftSaveState("idle");
        return;
      }

      const parsedDraft: unknown = JSON.parse(storedDraft);

      if (!isStoredTaskDraft(parsedDraft) || parsedDraft.category !== initialValues.category) {
        window.localStorage.removeItem(draftStorageKey);
        setDraftSaveState("idle");
        return;
      }

      if (!areTaskValuesEqual(parsedDraft, defaultCreateValues)) {
        reset(parsedDraft);
        setDraftSaveState("restored");
      }
    } catch (error) {
      console.error("Failed to restore task draft:", error);
      window.localStorage.removeItem(draftStorageKey);
      setDraftSaveState("idle");
    } finally {
      hasLoadedDraftRef.current = true;
    }
  }, [defaultCreateValues, draftStorageKey, initialValues.category, isCreateMode, reset]);

  useEffect(() => {
    if (!isCreateMode || !hasLoadedDraftRef.current) {
      return;
    }

    const nextDraft: CreateTaskFormData = {
      title: title ?? "",
      description: description ?? "",
      dueDate: dueDate ?? "",
      priority: priority ?? "medium",
      category: initialValues.category,
    };

    if (areTaskValuesEqual(nextDraft, defaultCreateValues)) {
      window.localStorage.removeItem(draftStorageKey);
      setDraftSaveState("idle");
      setLastDraftSavedAt(null);
      return;
    }

    setDraftSaveState("saving");

    const timeoutId = window.setTimeout(() => {
      try {
        window.localStorage.setItem(draftStorageKey, JSON.stringify(nextDraft));
        setDraftSaveState("saved");
        setLastDraftSavedAt(
          new Date().toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
          }),
        );
      } catch (error) {
        console.error("Failed to save task draft:", error);
        setDraftSaveState("idle");
      }
    }, 400);

    return () => window.clearTimeout(timeoutId);
  }, [
    defaultCreateValues,
    description,
    draftStorageKey,
    dueDate,
    initialValues.category,
    isCreateMode,
    priority,
    title,
  ]);

  async function onSubmit(data: CreateTaskFormData) {
    const result =
      isEditMode && taskId
        ? await updateTaskAction(taskId, {
            title: data.title,
            description: data.description,
            dueDate: data.dueDate,
            priority: data.priority,
            category: initialValues.category,
          })
        : await createTaskAction({
            title: data.title,
            description: data.description,
            dueDate: data.dueDate,
            priority: data.priority,
            category: initialValues.category,
          });

    if (!result.success) {
      console.error(`Failed to ${isEditMode ? "update" : "create"} task:`, result.error);
      toast.error(result.error);
      return;
    }

    toast.success(isEditMode ? "Task updated successfully" : "Task created successfully");

    if (isCreateMode) {
      window.localStorage.removeItem(draftStorageKey);
      setDraftSaveState("idle");
      setLastDraftSavedAt(null);
    }

    router.push("/");
    router.refresh();
  }

  function handleDiscardDraft() {
    reset(defaultCreateValues);
    window.localStorage.removeItem(draftStorageKey);
    setDraftSaveState("idle");
    setLastDraftSavedAt(null);
    toast.success("Draft cleared");
  }

  function handleCancel() {
    router.push("/");
  }

  async function handleDelete(): Promise<boolean> {
    if (!taskId) {
      return false;
    }

    setIsDeleting(true);

    try {
      const result = await deleteTaskAction(taskId);

      if (!result.success) {
        console.error("Failed to delete task:", result.error);
        toast.error(result.error);
        return false;
      }

      setIsDeleteDialogOpen(false);
      toast.success("Task deleted successfully");
      router.replace("/");
      return true;
    } catch (error) {
      console.error("Failed to delete task:", error);
      toast.error("Something went wrong. Please try again.");
      return false;
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className={styles.TaskForm_card}>
      <div className={styles.TaskForm_header}>
        <div className={styles.TaskForm_headerLeft}>
          <div>
            <span className="text-xs text-blue-500">{isEditMode ? "Edit Task" : "+ Add Task"}</span>
          </div>
          <h2 className={styles.TaskForm_title}>
            {isEditMode ? "Update task details" : "What needs to get done?"}
          </h2>
          <p className={styles.TaskForm_subtitle}>
            {isEditMode
              ? "Make changes to the task details below and save when you're ready."
              : "Fill in the details below - at minimum a title and description will get you started."}
          </p>
          {isCreateMode && draftSaveState !== "idle" ? (
            <p className={styles.TaskForm_draftStatus} aria-live="polite">
              {draftSaveState === "restored"
                ? "Draft restored from this browser."
                : draftSaveState === "saving"
                  ? "Saving draft locally..."
                  : `Draft saved locally${lastDraftSavedAt ? ` at ${lastDraftSavedAt}` : "."}`}
            </p>
          ) : null}
          {projectCode ? <span className={styles.TaskForm_projectCode}>{projectCode}</span> : null}
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
            placeholder="Add a description - what needs to be done, any context or notes..."
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
                data-category={initialValues.category}
              >
                {CATEGORY_LABELS[initialValues.category]}
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
          {isEditMode && taskId ? (
            <>
              <button
                type="button"
                className={styles.TaskForm_deleteBtn}
                disabled={isSubmitting || isDeleting}
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                Delete Task
              </button>
              <DeleteTaskDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                onConfirm={handleDelete}
                isDeleting={isDeleting}
                task={{
                  id: taskId,
                  title: initialValues.title,
                  project: projectCode ?? "Task",
                  dueDate: initialValues.dueDate,
                  assigneeName,
                  statusLabel: CATEGORY_LABELS[initialValues.category],
                }}
              />
            </>
          ) : (
            <div />
          )}
          <div className={styles.TaskForm_footerActions}>
            {isCreateMode && draftSaveState !== "idle" ? (
              <button
                type="button"
                className={styles.TaskForm_discardBtn}
                disabled={isSubmitting || isDeleting}
                onClick={handleDiscardDraft}
              >
                Discard Draft
              </button>
            ) : null}
            <button type="button" className={styles.TaskForm_cancelBtn} onClick={handleCancel}>
              Cancel
            </button>
            <button
              type="submit"
              className={styles.TaskForm_submitBtn}
              disabled={isSubmitting || isDeleting}
            >
              {isSubmitting
                ? isEditMode
                  ? "Saving..."
                  : "Creating..."
                : isEditMode
                  ? "Save Changes"
                  : "Create Task"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
