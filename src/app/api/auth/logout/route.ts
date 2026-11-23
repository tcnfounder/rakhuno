import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookies, deleteSession } from "@/lib/auth";
import { hasDatabase } from "@/lib/db";

export async function POST(req: NextRequest) {
  if (hasDatabase()) await deleteSession(req);
  const res = NextResponse.json({ ok: true });
  clearSessionCookies(res);
  return res;
}
