import type { SavedClient, SavedInvoice } from "@/lib/history";
import type { SellerProfile } from "@/lib/invoice";

/** What a signed-in browser and the server exchange. Same shapes as localStorage. */
export type AccountData = {
  profile: Partial<SellerProfile> | null;
  clients: SavedClient[];
  invoices: SavedInvoice[];
  counter: number;
};

const MAX_CLIENTS = 500;
const MAX_INVOICES = 1000;
const MAX_PROFILE_BYTES = 400_000;

function isObj(v: unknown): v is Record<string, unknown> {
  return Boolean(v) && typeof v === "object" && !Array.isArray(v);
}

function cleanClients(raw: unknown): SavedClient[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((c): c is SavedClient => isObj(c) && typeof c.id === "string" && typeof c.name === "string")
    .map((c) => ({
      id: c.id.slice(0, 300),
      name: c.name.slice(0, 300),
      taxId: String(c.taxId ?? "").slice(0, 20),
      address: String(c.address ?? "").slice(0, 500),
      lastUsedAt: Number(c.lastUsedAt) || 0,
      uses: Number(c.uses) || 0,
    }));
}

function cleanInvoices(raw: unknown): SavedInvoice[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (h): h is SavedInvoice =>
      isObj(h) && typeof h.id === "string" && h.id.length <= 300 && Array.isArray(h.items) && h.items.length <= 200,
  );
}

function cleanProfile(raw: unknown): Partial<SellerProfile> | null {
  if (!isObj(raw)) return null;
  const profile = raw as Partial<SellerProfile>;
  if (JSON.stringify(profile).length > MAX_PROFILE_BYTES) return { ...profile, sellerLogo: "" };
  return profile;
}

export function cleanAccountData(raw: unknown): AccountData {
  const body = isObj(raw) ? raw : {};
  return {
    profile: cleanProfile(body.profile),
    clients: cleanClients(body.clients),
    invoices: cleanInvoices(body.invoices),
    counter: Math.max(1, Math.min(1_000_000, Number(body.counter) || 1)),
  };
}

/** Union by id; the newer copy of a record wins. The browser's profile wins when it has a name. */
export function mergeAccountData(stored: AccountData, incoming: AccountData): AccountData {
  const clients = new Map(stored.clients.map((c) => [c.id, c]));
  for (const c of incoming.clients) {
    const old = clients.get(c.id);
    if (!old || c.lastUsedAt >= old.lastUsedAt) clients.set(c.id, { ...c, uses: Math.max(c.uses, old?.uses || 0) });
  }
  const invoices = new Map(stored.invoices.map((h) => [h.id, h]));
  for (const h of incoming.invoices) {
    const old = invoices.get(h.id);
    if (!old || (Number(h.savedAt) || 0) >= (Number(old.savedAt) || 0)) invoices.set(h.id, h);
  }
  const incomingHasProfile = Boolean(incoming.profile?.sellerName?.trim());
  return {
    profile: incomingHasProfile ? incoming.profile : stored.profile,
    clients: [...clients.values()].sort((a, b) => b.lastUsedAt - a.lastUsedAt).slice(0, MAX_CLIENTS),
    invoices: [...invoices.values()]
      .sort((a, b) => (Number(b.savedAt) || 0) - (Number(a.savedAt) || 0))
      .slice(0, MAX_INVOICES),
    counter: Math.max(stored.counter, incoming.counter),
  };
}
