import { betterAuth } from "better-auth";
import { db } from "./db";
import * as schema from "./db/schema";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { sendVerificationEmail } from "./email/mail";

export const auth = betterAuth({
  appName: "NextJS Todo App",
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BASE_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      // ...schema,
      user: schema.users, // Changed from users to user
      session: schema.sessions, // Changed from sessions to session
      account: schema.accounts, // Changed from accounts to account
    },
  }),
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      sendVerificationEmail(user.email, user.name, url).catch((error) => {
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
