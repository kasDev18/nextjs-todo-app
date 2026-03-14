import { createAuthClient } from "better-auth/client";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL || "http://localhost:3000",
  basePath: "/api/auth",
});

export const { useSession, signIn, signOut, signUp } = authClient;
