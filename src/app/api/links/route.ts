import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { hasDatabase } from "@/lib/db";
import { cleanInvoiceForLink, listInvoiceLinks, upsertInvoiceLink } from "@/lib/invoice-links";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!hasDatabase()) return NextResponse.json({ error: "accounts_off" }, { status: 503 });
  const user = await getSessionUser(req);
  if (!user) return NextResponse.json({ error: "signed_out" }, { status: 401 });
  return NextResponse.json({ links: await listInvoiceLinks(user.id) }, { headers: { "cache-control": "no-store" } });
}

export async function POST(req: NextRequest) {
  if (!hasDatabase()) return NextResponse.json({ error: "accounts_off" }, { status: 503 });
  const user = await getSessionUser(req);
  if (!user) return NextResponse.json({ error: "signed_out" }, { status: 401 });
  const raw = await req.text();
  if (raw.length > 600_000) return NextResponse.json({ error: "too_large" }, { status: 413 });
  let body: { invoice?: unknown };
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const data = cleanInvoiceForLink(body.invoice);
  if (!data) return NextResponse.json({ error: "incomplete_invoice" }, { status: 400 });
  const id = await upsertInvoiceLink(user.id, data);
  if (!id) return NextResponse.json({ error: "daily_limit" }, { status: 429 });
  return NextResponse.json({ id, url: `${req.nextUrl.origin}/r/${id}` });
}
