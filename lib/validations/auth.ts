import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(20, "Password must be at most 20 characters.");

export const signInSchema = z.object({
  email: z.email("Please enter a valid email address."),
  password: passwordSchema,
});

export const signUpSchema = z
  .object({
    name: z
      .string()
      .min(5, "Name must be at least 5 characters.")
      .max(20, "Name must be at most 20 characters."),
    email: z.email("Please enter a valid email address."),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type SignInFormData = z.infer<typeof signInSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;
