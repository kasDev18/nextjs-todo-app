import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

function getDatabaseSslConfig() {
  const sslMode = process.env.DATABASE_SSL?.trim().toLowerCase();

  if (!sslMode) {
    return process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false;
  }

  if (["false", "disable", "disabled", "off", "0"].includes(sslMode)) {
    return false;
  }

  if (["true", "require", "required", "on", "1"].includes(sslMode)) {
    return { rejectUnauthorized: false };
  }

  if (["verify-ca", "verify-full"].includes(sslMode)) {
    return { rejectUnauthorized: true };
  }

  throw new Error(
    `Unsupported DATABASE_SSL value "${process.env.DATABASE_SSL}". Use false, require, or verify-full.`,
  );
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: getDatabaseSslConfig(),
  max: 10,
});

export const db = drizzle(pool, { schema });

export async function getClient() {
  const client = await pool.connect();
  return client;
}
