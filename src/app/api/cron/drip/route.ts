import { NextRequest, NextResponse } from "next/server";
import { getWorkerEnv, processDay7Queue } from "@/lib/brevo-drip";

function authorized(req: NextRequest, secret: string | undefined) {
  if (!secret) return false;
  const header = req.headers.get("authorization") || "";
  if (header === `Bearer ${secret}`) return true;
  const urlSecret = req.nextUrl.searchParams.get("secret");
  return urlSecret === secret;
}

/** Hourly: schedule Day 7 once within Brevo's 3-day transactional window. */
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
