const PENDING_LEAD_KEY = "rakhuno.pendingLeadEmail";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

/** Remember a Brevo create so the conversion can wait until the PDF succeeds. */
export function markPendingLead(email: string) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(PENDING_LEAD_KEY, normalizeEmail(email));
  } catch {
    /* private mode */
  }
}

/** Consume the pending flag once, only for this email. */
export function takePendingLead(email: string): boolean {
  if (typeof window === "undefined") return false;
  const normalized = normalizeEmail(email);
  try {
    const pending = sessionStorage.getItem(PENDING_LEAD_KEY);
    if (!pending || pending !== normalized) return false;
    sessionStorage.removeItem(PENDING_LEAD_KEY);
    return true;
  } catch {
    return false;
  }
}

/** True only when Brevo created a new contact (`created: true`). */
export async function submitInvoiceLead(
  email: string,
  fopGroup?: string,
): Promise<boolean> {
  const res = await fetch("/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      source: "invoice_pdf",
      ...(fopGroup ? { fopGroup } : {}),
    }),
  });
  if (!res.ok) return false;
  const body = (await res.json()) as { created?: boolean };
  return body.created === true;
}
