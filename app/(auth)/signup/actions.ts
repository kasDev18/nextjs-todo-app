"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { APIError } from "better-auth/api";

type SignUpResult = { success: true } | { success: false; error: string };

export async function signUpAction(
  name: string,
  email: string,
  password: string,
): Promise<SignUpResult> {
  try {
    await auth.api.signUpEmail({
      headers: await headers(),
      body: { name, email, password },
    });

    return { success: true };
  } catch (err) {
    if (err instanceof APIError) {
      return { success: false, error: err.message };
    }
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
