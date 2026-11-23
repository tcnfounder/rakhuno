import { NextRequest, NextResponse } from "next/server";
import { createLoginToken, loginEmail, normalizeEmail, safeNext } from "@/lib/auth";
import { getWorkerEnv } from "@/lib/brevo-drip";
import { hasDatabase } from "@/lib/db";
import { sendHtmlEmail } from "@/lib/tax-reminders";

/** Emails a one-time login link. Answers the same way for every valid address. */
export async function POST(req: NextRequest) {
  if (!hasDatabase()) return NextResponse.json({ error: "accounts_off" }, { status: 503 });
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const email = normalizeEmail(body.email);
  if (!email) return NextResponse.json({ error: "invalid_email" }, { status: 400 });

  const token = await createLoginToken(email, safeNext(body.next));
  if (!token) return NextResponse.json({ ok: true });

  const link = `${req.nextUrl.origin}/login/verify?token=${token}`;
  const env = await getWorkerEnv();
  const sent = await sendHtmlEmail(env, email, loginEmail(link), ["rakhuno-login"]);
  if (sent !== "sent") {
    if (process.env.NODE_ENV !== "production") console.log("[login-link]", link);
    else console.error("[login-link] not sent:", sent);
  }
  return NextResponse.json({ ok: true });
}
