"use client";

import { Suspense, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import styles from "./styles.module.css";
import { getSafeRedirectPath } from "@/lib/auth-redirect";
import { cn } from "@/lib/utils";
import { signUpSchema, type SignUpFormData } from "@/lib/validations/auth";
import { signUpAction } from "./actions";
import { toast } from "sonner";

function SignUpPageContent() {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = getSafeRedirectPath(searchParams.get("redirectTo"));

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>({
    // Work around a known zodResolver typing bug with zod 4.3.x on clean installs.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(signUpSchema as any),
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
    router.push(
      redirectTo === "/" ? "/signin" : `/signin?redirectTo=${encodeURIComponent(redirectTo)}`,
    );
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
          <Link
            className={styles.SignUp_signinRowLink}
            href={
              redirectTo === "/"
                ? "/signin"
                : `/signin?redirectTo=${encodeURIComponent(redirectTo)}`
            }
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <SignUpPageContent />
    </Suspense>
  );
}
