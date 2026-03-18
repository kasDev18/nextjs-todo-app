import type { BoardColumn } from "@/app/(home)/components/constants";
import type { CreateTaskFormData } from "@/lib/validations/task";

export const CATEGORY_LABELS: Record<BoardColumn["category"], string> = {
  todo: "To Do",
  inProgress: "In Progress",
  done: "Done",
};

export type TaskFormMode = "create" | "edit";

export type TaskFormProps = {
  mode: TaskFormMode;
  assigneeName: string;
  taskId?: string;
  projectCode?: string;
  initialValues: CreateTaskFormData;
};
