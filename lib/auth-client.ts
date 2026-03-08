import { createAuthClient } from "better-auth/client";

export const authClient = createAuthClient({
  baseURL: process.env.BASE_URL || "http://localhost:3000",
});

export const { useSession, signIn, signOut, signUp } = authClient;
