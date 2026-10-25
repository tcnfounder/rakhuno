import { trackEvent } from "@/lib/analytics";

/**
 * Repeat-use measurement. Invoice data never leaves the browser, so the only
 * honest way to know whether a FOP comes back is a per-browser counter.
 *
 * GA4 events:
 * - `invoice_created`   every new invoice PDF (params: invoice_index, days_since_first, is_repeat)
 * - `second_invoice`    once, when the same browser makes its 2nd invoice  ← activation key event
 * - `returning_invoicer` once per session, when someone who already made an invoice opens /invoice
 *
 * Re-downloading the same invoice (same number + date) is not counted again.
 */
const USAGE_KEY = "rakhuno.usage.v1";
const RETURN_SESSION_KEY = "rakhuno.returnTracked";
const DAY_MS = 24 * 60 * 60 * 1000;

type Usage = {
  firstAt: number;
  lastAt: number;
  count: number;
  /** `${number}|${date}` of the last counted invoice, to skip re-downloads. */
  lastKey: string;
};

function read(): Usage | null {
  try {
    const raw = window.localStorage.getItem(USAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Usage>;
    if (!parsed.firstAt || !parsed.count) return null;
    return {
      firstAt: Number(parsed.firstAt),
      lastAt: Number(parsed.lastAt) || Number(parsed.firstAt),
      count: Number(parsed.count),
      lastKey: String(parsed.lastKey || ""),
    };
  } catch {
    return null;
  }
}

function write(usage: Usage) {
  try {
    window.localStorage.setItem(USAGE_KEY, JSON.stringify(usage));
  } catch {
    /* ignore — private mode etc. */
  }
}

function daysBetween(from: number, to: number) {
  return Math.max(0, Math.floor((to - from) / DAY_MS));
}

/** Call after a PDF for a new invoice was produced. */
export function recordInvoiceCreated(invoiceNumber: string, invoiceDate: string) {
  if (typeof window === "undefined") return;
  const now = Date.now();
  const key = `${invoiceNumber.trim()}|${invoiceDate}`;
  const prev = read();
  if (prev && prev.lastKey === key) return;

  const usage: Usage = prev
    ? { ...prev, count: prev.count + 1, lastAt: now, lastKey: key }
    : { firstAt: now, lastAt: now, count: 1, lastKey: key };
  write(usage);

  const daysSinceFirst = daysBetween(usage.firstAt, now);
  trackEvent("invoice_created", {
    invoice_index: usage.count,
    days_since_first: daysSinceFirst,
    is_repeat: usage.count > 1,
  });
  if (usage.count === 2) {
    trackEvent("second_invoice", { days_since_first: daysSinceFirst });
  }
}

/**
 * Call once when /invoice mounts. `hasSavedProfile` covers people who made an
 * invoice before this counter existed (their ФОП profile is already saved).
 */
export function recordReturnVisit(hasSavedProfile: boolean) {
  if (typeof window === "undefined") return;
  const usage = read();
  if (!usage && !hasSavedProfile) return;
  try {
    if (window.sessionStorage.getItem(RETURN_SESSION_KEY)) return;
    window.sessionStorage.setItem(RETURN_SESSION_KEY, "1");
  } catch {
    /* ignore */
  }
  const now = Date.now();
  trackEvent("returning_invoicer", {
    invoices_before: usage?.count ?? 0,
    days_since_first: usage ? daysBetween(usage.firstAt, now) : -1,
    days_since_last: usage ? daysBetween(usage.lastAt, now) : -1,
    legacy_profile: !usage && hasSavedProfile,
  });
}
