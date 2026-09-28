import { NextRequest, NextResponse } from "next/server";
import { submitIndexNow } from "@/lib/indexnow";

/**
 * Manual / cron-friendly IndexNow ping.
 * Auth: Authorization Bearer must match INDEXNOW_PING_SECRET, or if unset,
 * only allow from same-origin-ish deploy hooks via x-rakhuno-indexnow header
 * matching the public key file name (weak but enough for low-risk ping).
 */
export async function POST(req: NextRequest) {
  const secret = process.env.INDEXNOW_PING_SECRET?.trim();
  const auth = req.headers.get("authorization") || "";
  const fallback = req.headers.get("x-rakhuno-indexnow") || "";

  const allowed = secret
    ? auth === `Bearer ${secret}`
    : fallback === "cdbb17d3ba4605c01feb2fb2643330ac";

  if (!allowed) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const result = await submitIndexNow();
    return NextResponse.json(result);
  } catch (e) {
    console.error("[indexnow]", e);
    return NextResponse.json({ error: "submit_failed" }, { status: 502 });
  }
}
