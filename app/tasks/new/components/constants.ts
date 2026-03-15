import type { BoardColumn } from "@/app/(home)/components/constants";

export const CATEGORY_LABELS: Record<BoardColumn["category"], string> = {
  todo: "To Do",
  inProgress: "In Progress",
  done: "Done",
};

export type TaskFormProps = {
  defaultCategory: BoardColumn["category"];
  assigneeName: string;
};
