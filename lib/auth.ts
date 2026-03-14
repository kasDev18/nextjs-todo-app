import { betterAuth } from "better-auth";
import { db } from "./db";
import * as schema from "./db/schema";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { sendVerificationEmail } from "./email/mail";
import { headers } from "next/headers";

export const auth = betterAuth({
  appName: "NextJS Todo App",
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL,
  basePath: "/api/auth",
  trustedOrigins: [process.env.BASE_URL, process.env.NEXT_PUBLIC_BASE_URL].filter(
    (origin): origin is string => Boolean(origin),
  ),
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      // ...schema,
      user: schema.users, // Changed from users to user
      session: schema.sessions, // Changed from sessions to session
      account: schema.accounts, // Changed from accounts to account
      task: schema.tasks, // Changed from tasks to task
    },
  }),
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerificationEmail(user.email, user.name, url).catch((error) => {
        console.error("Failed to send verification email:", error);
      });
    },
    sendOnSignIn: true,
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
    maxPasswordLength: 20,
    allowSignIn: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
    disableSessionRefresh: true,
  },
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
    defaultCookieAttributes: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    },
  },
});

export async function getUserFromSession() {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });
  return session;
}

export async function getIsAuthor(postAuthorId?: string | null) {
  const session = await getUserFromSession();
  if (!session || !session.user || !postAuthorId) {
    return false;
  }
  return session.user.id === postAuthorId;
}
