import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { hasDatabase } from "@/lib/db";
import { updateInvoiceLink } from "@/lib/invoice-links";

/** Owner actions: mark paid / unpaid, or revoke the public link. */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!hasDatabase()) return NextResponse.json({ error: "accounts_off" }, { status: 503 });
  const user = await getSessionUser(req);
  if (!user) return NextResponse.json({ error: "signed_out" }, { status: 401 });
  const { id } = await params;
  let body: { paid?: unknown; revoke?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const ok = await updateInvoiceLink(user.id, id, {
    paid: typeof body.paid === "boolean" ? body.paid : undefined,
    revoke: body.revoke === true,
  });
  return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "not_found" }, { status: 404 });
}
