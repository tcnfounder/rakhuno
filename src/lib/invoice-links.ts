import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import { calcTotal, type InvoiceData } from "@/lib/invoice";

/**
 * Shareable invoice links (rakhuno.com/r/<id>). Only signed-in users can create them, so every
 * public page with an IBAN on it belongs to a confirmed email and can be revoked.
 */

const ID_ALPHABET = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const MAX_LINKS_PER_DAY = 50;
const MAX_LOGO_CHARS = 300_000;

export type InvoiceLinkRow = {
  id: string;
  data: InvoiceData;
  total: string;
  created_at: Date;
  first_viewed_at: Date | null;
  views: number;
  paid_at: Date | null;
  revoked_at: Date | null;
  user_id: string;
};

export type InvoiceLinkSummary = {
  id: string;
  number: string;
  date: string;
  buyerName: string;
  total: number;
  createdAt: string;
  firstViewedAt: string | null;
  views: number;
  paidAt: string | null;
};

function newLinkId() {
  const bytes = randomBytes(10);
  return Array.from(bytes, (b) => ID_ALPHABET[b % ID_ALPHABET.length]).join("");
}

const str = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");

/** Keeps only the invoice fields the public page shows. Null when it cannot be paid. */
export function cleanInvoiceForLink(raw: unknown): InvoiceData | null {
  if (!raw || typeof raw !== "object") return null;
  const d = raw as Record<string, unknown>;
  const items = Array.isArray(d.items)
    ? d.items
        .slice(0, 100)
        .map((i) => (i && typeof i === "object" ? (i as Record<string, unknown>) : {}))
        .map((i) => ({
          id: str(i.id, 80),
          description: str(i.description, 500),
          unit: str(i.unit, 40),
          qty: str(i.qty, 20),
          price: str(i.price, 20),
        }))
        .filter((i) => i.description.trim())
    : [];
  const logo = str(d.sellerLogo, MAX_LOGO_CHARS + 1);
  const data: InvoiceData = {
    number: str(d.number, 40),
    date: str(d.date, 10),
    sellerLogo: logo.length > MAX_LOGO_CHARS || !logo.startsWith("data:image/") ? "" : logo,
    sellerName: str(d.sellerName, 200),
    sellerTaxId: str(d.sellerTaxId, 20),
    sellerAddress: str(d.sellerAddress, 300),
    sellerIban: str(d.sellerIban, 40),
    sellerBank: str(d.sellerBank, 120),
    buyerName: str(d.buyerName, 300),
    buyerTaxId: str(d.buyerTaxId, 20),
    buyerAddress: str(d.buyerAddress, 300),
    items,
    note: str(d.note, 1000),
    fopGroup: d.fopGroup === "2" || d.fopGroup === "3" ? d.fopGroup : "",
  };
  if (!data.sellerName.trim() || data.sellerIban.replace(/\s/g, "").length < 15 || !items.length) return null;
  if (!(calcTotal(items) > 0)) return null;
  return data;
}

/** Creates the link, or updates the existing one for the same invoice number and date. */
export async function upsertInvoiceLink(userId: string, data: InvoiceData): Promise<string | null> {
  const sql = await db();
  const key = `${data.number.trim()}|${data.date}`;
  const [{ count }] = await sql<{ count: number }[]>`
    SELECT count(*)::int AS count FROM invoice_links
    WHERE user_id = ${userId} AND created_at > now() - interval '1 day'`;
  const existing = await sql<{ id: string }[]>`
    SELECT id FROM invoice_links WHERE user_id = ${userId} AND invoice_key = ${key}`;
  if (!existing.length && count >= MAX_LINKS_PER_DAY) return null;
  const total = calcTotal(data.items);
  const [row] = await sql<{ id: string }[]>`
    INSERT INTO invoice_links (id, user_id, invoice_key, data, total)
    VALUES (${newLinkId()}, ${userId}, ${key}, ${sql.json(data as never)}, ${total})
    ON CONFLICT (user_id, invoice_key) DO UPDATE
      SET data = EXCLUDED.data, total = EXCLUDED.total, updated_at = now(), revoked_at = NULL
    RETURNING id`;
  return row.id;
}

/** The public page. Counts a view unless the owner is looking. */
export async function openInvoiceLink(id: string, viewerUserId: string | null) {
  if (!/^[A-Za-z0-9]{6,20}$/.test(id)) return null;
  const sql = await db();
  const rows = await sql<InvoiceLinkRow[]>`
    SELECT id, user_id, data, total, created_at, first_viewed_at, views, paid_at, revoked_at
    FROM invoice_links WHERE id = ${id}`;
  const row = rows[0];
  if (!row || row.revoked_at) return null;
  if (viewerUserId !== row.user_id) {
    await sql`
      UPDATE invoice_links
      SET views = views + 1, last_viewed_at = now(), first_viewed_at = coalesce(first_viewed_at, now())
      WHERE id = ${id}`;
  }
  return { ...row, isOwner: viewerUserId === row.user_id };
}

export async function listInvoiceLinks(userId: string): Promise<InvoiceLinkSummary[]> {
  const sql = await db();
  const rows = await sql<InvoiceLinkRow[]>`
    SELECT id, user_id, data, total, created_at, first_viewed_at, views, paid_at, revoked_at
    FROM invoice_links WHERE user_id = ${userId} AND revoked_at IS NULL
    ORDER BY created_at DESC LIMIT 100`;
  return rows.map((r) => ({
    id: r.id,
    number: r.data.number,
    date: r.data.date,
    buyerName: r.data.buyerName,
    total: Number(r.total),
    createdAt: r.created_at.toISOString(),
    firstViewedAt: r.first_viewed_at ? r.first_viewed_at.toISOString() : null,
    views: r.views,
    paidAt: r.paid_at ? r.paid_at.toISOString() : null,
  }));
}

export async function updateInvoiceLink(userId: string, id: string, change: { paid?: boolean; revoke?: boolean }) {
  const sql = await db();
  if (change.revoke) {
    const r = await sql`UPDATE invoice_links SET revoked_at = now() WHERE id = ${id} AND user_id = ${userId}`;
    return r.count > 0;
  }
  if (typeof change.paid === "boolean") {
    const r = await sql`
      UPDATE invoice_links SET paid_at = ${change.paid ? sql`now()` : null}
      WHERE id = ${id} AND user_id = ${userId}`;
    return r.count > 0;
  }
  return false;
}
