"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { APIError } from "better-auth/api";
import { getUserByEmail } from "@/lib/db/users";

type SignUpResult = { success: true } | { success: false; error: string };

export async function signUpAction(
  name: string,
  email: string,
  password: string,
): Promise<SignUpResult> {
  try {
    const existing = await getUserByEmail(email);

    if (existing.length > 0) {
      return { success: false, error: "An account with this email already exists." };
    }

    await auth.api.signUpEmail({
      headers: await headers(),
      body: { name, email, password, callbackURL: "/" },
    });

    return { success: true };
  } catch (err) {
    if (err instanceof APIError) {
      return { success: false, error: err.message };
    }
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
