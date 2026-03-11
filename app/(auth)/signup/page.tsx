"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import Link from "next/link";
import styles from "./styles.module.css";
import { cn } from "@/lib/utils";
import { signUpSchema, type SignUpFormData } from "@/lib/validations/auth";
import { signUpAction } from "./actions";
import { toast } from "sonner";
import { useTheme } from "next-themes";

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();
  const { resolvedTheme } = useTheme();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: SignUpFormData) {
    setServerError(null);

    const result = await signUpAction(data.name, data.email, data.password);

    if (!result.success) {
      setServerError(result.error);
      return;
    }

    toast.success("Account created successfully");
    router.push("/signin");
  }

  return (
    <div className={cn("animate-rise", styles.SignUp)}>
      <div className={styles.SignUp_content}>
        <div className={styles.SignUp_contentHeader}>
          <div className={styles.SignUp_contentHeaderTitle}>
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
            Create account
          </div>
          <h2 className={styles.SignUp_greeting}>Get started</h2>
          <p className="text-secondary">Create your workspace in seconds.</p>
        </div>

        <div className={styles.SignUp_socialBtns}>
          <Button
            variant="ghost"
            type="button"
            className={cn(
              styles.SignUp_socialBtn,
              resolvedTheme === "dark"
                ? styles.SignUp_socialBtn___dark
                : styles.SignUp_socialBtn___light,
            )}
          >
            <svg viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google
          </Button>
          <Button
            variant="ghost"
            type="button"
            className={cn(
              styles.SignUp_socialBtn,
              resolvedTheme === "dark"
                ? styles.SignUp_socialBtn___dark
                : styles.SignUp_socialBtn___light,
            )}
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
            GitHub
          </Button>
        </div>

        <div className={styles.SignUp_orRow}>
          <span>or email</span>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {serverError && <div className={styles.SignUp_serverError}>{serverError}</div>}

          <Field className="mb-4" data-invalid={!!errors.name}>
            <FieldLabel className={styles.SignUp_fieldLabel}>Full name</FieldLabel>
            <div className="relative">
              <Input
                className={cn(
                  styles.SignUp_fieldInput,
                  errors.name && styles.SignUp_fieldInputError,
                )}
                type="text"
                placeholder="Jane Doe"
                aria-invalid={!!errors.name}
                {...register("name")}
              />
              <span className={styles.SignUp_fieldIcon}>
                <svg viewBox="0 0 24 24">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
            </div>
            {errors.name && <FieldError className="text-rose">{errors.name.message}</FieldError>}
          </Field>

          <Field className="mb-4" data-invalid={!!errors.email}>
            <FieldLabel className={styles.SignUp_fieldLabel}>Email</FieldLabel>
            <div className="relative">
              <Input
                className={cn(
                  styles.SignUp_fieldInput,
                  (errors.email || serverError) && styles.SignUp_fieldInputError,
                )}
                type="email"
                placeholder="sample@example.com"
                aria-invalid={!!errors.email}
                {...register("email")}
              />
              <span className={styles.SignUp_fieldIcon}>
                <svg viewBox="0 0 24 24">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </span>
            </div>
            {errors.email && <FieldError className="text-rose">{errors.email.message}</FieldError>}
          </Field>

          <Field className="mb-4" data-invalid={!!errors.password}>
            <FieldLabel className={styles.SignUp_fieldLabel}>Password</FieldLabel>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••"
                className={cn(
                  styles.SignUp_fieldInput,
                  errors.password && styles.SignUp_fieldInputError,
                )}
                aria-invalid={!!errors.password}
                {...register("password")}
              />
              <span
                className={styles.SignUp_fieldIcon}
                onClick={() => setShowPassword(!showPassword)}
                role="button"
                tabIndex={0}
                aria-label={showPassword ? "Hide password" : "Show password"}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") setShowPassword(!showPassword);
                }}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </span>
            </div>
            {errors.password && (
              <FieldError className="text-rose">{errors.password.message}</FieldError>
            )}
          </Field>

          <Field className="mb-5" data-invalid={!!errors.confirmPassword}>
            <FieldLabel className={styles.SignUp_fieldLabel}>Confirm password</FieldLabel>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••"
                className={cn(
                  styles.SignUp_fieldInput,
                  errors.confirmPassword && styles.SignUp_fieldInputError,
                )}
                aria-invalid={!!errors.confirmPassword}
                {...register("confirmPassword")}
              />
              <span className={styles.SignUp_fieldIcon}>
                <svg viewBox="0 0 24 24">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </span>
            </div>
            {errors.confirmPassword && (
              <FieldError className="text-rose">{errors.confirmPassword.message}</FieldError>
            )}
          </Field>

          <Button
            variant="default"
            size="lg"
            className={styles.SignUp_btnSubmit}
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating account\u2026" : "Create account \u2192"}
          </Button>
        </form>

        <div className={styles.SignUp_signinRow}>
          Already have an account?{" "}
          <Link className={styles.SignUp_signinRowLink} href="/signin">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
