import { z } from "zod";

function isFutureDate(value: string) {
  const selectedDate = new Date(`${value}T00:00:00`);
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  return selectedDate > today;
}

export const createTaskSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters.")
    .max(100, "Title must be at most 100 characters."),
  description: z
    .string()
    .min(5, "Description must be at least 5 characters.")
    .max(500, "Description must be at most 500 characters."),
  dueDate: z
    .string()
    .min(1, "Due date is required.")
    .refine(isFutureDate, "Due date must be a future date."),
  priority: z.enum(["low", "medium", "high", "critical"], {
    message: "Please select a priority.",
  }),
  category: z.enum(["todo", "inProgress", "done"]),
});

export type CreateTaskFormData = z.infer<typeof createTaskSchema>;
