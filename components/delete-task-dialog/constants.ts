export type DeleteTaskDialogTask = {
  id: string;
  title: string;
  project: string;
  dueDate: string;
  assigneeName: string;
  statusLabel: string;
};

export type DeleteTaskDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<boolean> | boolean;
  isDeleting?: boolean;
  task: DeleteTaskDialogTask | null;
};
