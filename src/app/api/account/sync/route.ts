import { NextRequest, NextResponse } from "next/server";
import { cleanAccountData } from "@/lib/account-data";
import { syncAccountData } from "@/lib/account-store";
import { getSessionUser } from "@/lib/auth";
import { hasDatabase } from "@/lib/db";

export async function POST(req: NextRequest) {
  if (!hasDatabase()) return NextResponse.json({ error: "accounts_off" }, { status: 503 });
  const user = await getSessionUser(req);
  if (!user) return NextResponse.json({ error: "signed_out" }, { status: 401 });
  const raw = await req.text();
  if (raw.length > 2_000_000) return NextResponse.json({ error: "too_large" }, { status: 413 });
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const merged = await syncAccountData(user.id, cleanAccountData(body));
  return NextResponse.json({ email: user.email, ...merged }, { headers: { "cache-control": "no-store" } });
}
