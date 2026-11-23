import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { readAccountData } from "@/lib/account-store";
import { hasDatabase } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!hasDatabase()) return NextResponse.json({ error: "accounts_off" }, { status: 503 });
  const user = await getSessionUser(req);
  if (!user) return NextResponse.json({ error: "signed_out" }, { status: 401 });
  const data = await readAccountData(user.id);
  return NextResponse.json({ email: user.email, ...data }, { headers: { "cache-control": "no-store" } });
}
