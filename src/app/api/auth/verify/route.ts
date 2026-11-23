import { NextRequest, NextResponse } from "next/server";
import { redeemLoginToken, setSessionCookies } from "@/lib/auth";
import { hasDatabase } from "@/lib/db";

/**
 * Redeems the emailed token. It is a POST sent by /login/verify, not the link itself,
 * so mail scanners that open links do not use up the token.
 */
export async function POST(req: NextRequest) {
  if (!hasDatabase()) return NextResponse.json({ error: "accounts_off" }, { status: 503 });
  let token = "";
  try {
    const body = (await req.json()) as { token?: unknown };
    token = typeof body.token === "string" ? body.token.slice(0, 100) : "";
  } catch {
    /* fall through */
  }
  if (!token) return NextResponse.json({ error: "invalid_token" }, { status: 400 });

  const result = await redeemLoginToken(token);
  if (!result) return NextResponse.json({ error: "expired" }, { status: 400 });

  const res = NextResponse.json({ ok: true, next: result.next, created: result.created });
  setSessionCookies(res, result.sessionToken);
  return res;
}
