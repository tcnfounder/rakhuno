import { NextRequest, NextResponse } from "next/server";
import { submitIndexNow } from "@/lib/indexnow";

const NOINDEX = { "X-Robots-Tag": "noindex, nofollow" };

/**
 * Bots / browsers that GET this path used to hit a 404 HTML document and pollute GA.
 * Answer with an empty 204 + noindex instead.
 */
export async function GET() {
  return new NextResponse(null, { status: 204, headers: NOINDEX });
}

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
    return NextResponse.json({ error: "unauthorized" }, { status: 401, headers: NOINDEX });
  }

  try {
    const result = await submitIndexNow();
    return NextResponse.json(result, { headers: NOINDEX });
  } catch (e) {
    console.error("[indexnow]", e);
    return NextResponse.json({ error: "submit_failed" }, { status: 502, headers: NOINDEX });
  }
}
