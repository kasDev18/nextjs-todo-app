import { db } from "../index";
import { users } from "../schema";
import { eq } from "drizzle-orm";

export const getUserByEmail = async (email: string) => {
  const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return user;
};
