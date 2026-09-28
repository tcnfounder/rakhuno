import { NextRequest, NextResponse } from "next/server";
import { getWorkerEnv, processDay7Queue } from "@/lib/brevo-drip";

function authorized(req: NextRequest, secret: string | undefined) {
  // Optional manual trigger. If CRON_SECRET unset, HTTP endpoint stays closed
  // (in-process Railway cron does not need this).
  if (!secret) return false;
  const header = req.headers.get("authorization") || "";
  if (header === `Bearer ${secret}`) return true;
  const urlSecret = req.nextUrl.searchParams.get("secret");
  return urlSecret === secret;
}

/** Optional manual trigger. Day 7 normally runs in-process on Railway. */
async function handle(req: NextRequest) {
  const env = await getWorkerEnv();
  if (!authorized(req, env.CRON_SECRET)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const result = await processDay7Queue(env);
  return NextResponse.json(result);
}

export async function GET(req: NextRequest) {
  return handle(req);
}

export async function POST(req: NextRequest) {
  return handle(req);
}
