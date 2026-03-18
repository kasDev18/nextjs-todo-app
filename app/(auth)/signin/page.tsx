"use client";

import { Suspense, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import styles from "./styles.module.css";
import { cn } from "@/lib/utils";
import { getSafeRedirectPath } from "@/lib/auth-redirect";
import { signInSchema, type SignInFormData } from "@/lib/validations/auth";
import { signIn } from "@/lib/auth-client";

function SignInPageContent() {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = getSafeRedirectPath(searchParams.get("redirectTo"));

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>({
    // Work around a known zodResolver typing bug with zod 4.3.x on clean installs.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(signInSchema as any),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: SignInFormData) {
    setServerError(null);

    const { error } = await signIn.email({
      email: data.email,
      password: data.password,
    });

    if (error) {
      setServerError(error.message ?? "Invalid email or password.");
      return;
    }

    router.replace(redirectTo);
    router.refresh();
  }

  return (
    <main className={cn("animate-rise", styles.SignIn)}>
      <div className={styles.SignIn_content}>
        <div className={styles.SignIn_contentHeader}>
          <div className={styles.SignIn_contentHeaderTitle}>
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Secure sign in
          </div>
          <h2 className={styles.SignIn_greeting}>Welcome back</h2>
          <p className="text-secondary">Continue to your workspace.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {serverError && <div className={styles.SignIn_serverError}>{serverError}</div>}

          <Field className="mb-4" data-invalid={!!errors.email}>
            <FieldLabel className={styles.SignIn_fieldLabel}>Work email</FieldLabel>
            <div className="relative">
              <Input
                className={cn(
                  styles.SignIn_fieldInput,
                  errors.email && styles.SignIn_fieldInputError,
                )}
                type="email"
                placeholder="sample@example.com"
                aria-invalid={!!errors.email}
                {...register("email")}
              />
              <span className={styles.SignIn_fieldIcon}>
                <svg viewBox="0 0 24 24">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </span>
            </div>
            {errors.email && <FieldError className="text-rose">{errors.email.message}</FieldError>}
          </Field>

          <Field className="mb-4" data-invalid={!!errors.password}>
            <FieldLabel className={styles.SignIn_fieldLabel}>Password</FieldLabel>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••"
                className={cn(
                  styles.SignIn_fieldInput,
                  errors.password && styles.SignIn_fieldInputError,
                )}
                aria-invalid={!!errors.password}
                {...register("password")}
              />
              <span
                className={styles.SignIn_fieldIcon}
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

          <Button
            variant="default"
            size="lg"
            className={styles.SignIn_btnSubmit}
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in\u2026" : "Continue to workspace \u2192"}
          </Button>
        </form>

        <div className={styles.SignIn_signupRow}>
          No account?{" "}
          <Link
            className={styles.SignIn_signupRowLink}
            href={
              redirectTo === "/"
                ? "/signup"
                : `/signup?redirectTo=${encodeURIComponent(redirectTo)}`
            }
          >
            Start free — no card needed
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInPageContent />
    </Suspense>
  );
}
