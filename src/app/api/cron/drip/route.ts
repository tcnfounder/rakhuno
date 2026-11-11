import { NextRequest, NextResponse } from "next/server";
import { getWorkerEnv, processDay7Queue } from "@/lib/brevo-drip";
import { parseGroup, processTaxReminders } from "@/lib/tax-reminders";

function authorized(req: NextRequest, secret: string | undefined) {
  // Closed unless CRON_SECRET is set. Vercel cron sends it as a Bearer token.
  if (!secret) return false;
  const header = req.headers.get("authorization") || "";
  if (header === `Bearer ${secret}`) return true;
  const urlSecret = req.nextUrl.searchParams.get("secret");
  return urlSecret === secret;
}

/**
 * Daily cron (vercel.json): day 7 drip + tax deadline reminders.
 *
 * Manual checks with the same secret:
 * - `?dry=1` — list who would get a reminder today, send nothing.
 * - `?date=2026-11-16` — pretend today is that date (with dry or test_to).
 * - `?test_to=you@example.com&group=3` — send one reminder to that address only.
 */
async function handle(req: NextRequest) {
  const env = await getWorkerEnv();
  if (!authorized(req, env.CRON_SECRET)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const q = req.nextUrl.searchParams;
  const dryRun = q.get("dry") === "1";
  const dateRaw = q.get("date");
  const today = dateRaw && /^\d{4}-\d{2}-\d{2}$/.test(dateRaw) ? new Date(`${dateRaw}T07:00:00`) : undefined;
  const testTo = q.get("test_to")?.trim() || undefined;
  const isManual = dryRun || Boolean(testTo) || Boolean(today);

  const reminders = await processTaxReminders(env, {
    today,
    dryRun,
    testTo,
    testGroup: parseGroup(q.get("group")),
  });
  const day7 = isManual ? { skipped: "manual run" } : await processDay7Queue(env);
  return NextResponse.json({ reminders, day7 });
}

export async function GET(req: NextRequest) {
  return handle(req);
}

export async function POST(req: NextRequest) {
  return handle(req);
}
