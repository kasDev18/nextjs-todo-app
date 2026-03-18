import { NextResponse } from "next/server";
import { getClient } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const noStoreHeaders = {
  "Cache-Control": "no-store, max-age=0",
};

export async function GET() {
  try {
    const client = await getClient();

    try {
      await client.query("SELECT 1");
    } finally {
      client.release();
    }

    return NextResponse.json(
      {
        status: "ok",
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.floor(process.uptime()),
      },
      { headers: noStoreHeaders },
    );
  } catch (error) {
    console.error("[healthcheck] Database connectivity check failed.", error);

    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
      },
      {
        status: 503,
        headers: noStoreHeaders,
      },
    );
  }
}
