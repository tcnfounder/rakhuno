import {
  calcTotal,
  newId,
  type InvoiceData,
  type InvoiceItem,
} from "@/lib/invoice";

/**
 * Saved clients and recent invoices. Like the seller profile, they stay in this browser's
 * localStorage and never reach the server.
 */
const CLIENTS_KEY = "rakhuno.clients.v1";
const HISTORY_KEY = "rakhuno.history.v1";
const MAX_CLIENTS = 50;
const MAX_HISTORY = 30;

export type SavedClient = {
  id: string;
  name: string;
  taxId: string;
  address: string;
  lastUsedAt: number;
  uses: number;
};

export type SavedInvoice = {
  id: string;
  number: string;
  date: string;
  buyerName: string;
  buyerTaxId: string;
  buyerAddress: string;
  items: InvoiceItem[];
  note: string;
  total: number;
  savedAt: number;
};

function readList<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function writeList<T>(key: string, list: T[]) {
  try {
    window.localStorage.setItem(key, JSON.stringify(list));
  } catch {
    /* private mode or quota — the invoice itself still works */
  }
}

const clientKey = (name: string, taxId: string) =>
  `${name.trim().toLowerCase().replace(/\s+/g, " ")}|${taxId.trim()}`;

export function loadClients(): SavedClient[] {
  return readList<SavedClient>(CLIENTS_KEY)
    .filter((c) => c && typeof c.name === "string" && c.name.trim())
    .sort((a, b) => b.lastUsedAt - a.lastUsedAt);
}

export function loadHistory(): SavedInvoice[] {
  return readList<SavedInvoice>(HISTORY_KEY)
    .filter((h) => h && Array.isArray(h.items))
    .sort((a, b) => b.savedAt - a.savedAt);
}

/** Store the buyer and the invoice after a PDF was produced. */
export function rememberInvoice(data: InvoiceData) {
  if (typeof window === "undefined") return;
  const now = Date.now();
  const name = data.buyerName.trim();

  if (name) {
    const id = clientKey(name, data.buyerTaxId);
    const clients = loadClients();
    const existing = clients.find((c) => c.id === id);
    const updated: SavedClient = {
      id,
      name,
      taxId: data.buyerTaxId.trim(),
      address: data.buyerAddress.trim() || existing?.address || "",
      lastUsedAt: now,
      uses: (existing?.uses || 0) + 1,
    };
    writeList(
      CLIENTS_KEY,
      [updated, ...clients.filter((c) => c.id !== id)].slice(0, MAX_CLIENTS),
    );
  }

  const items = data.items.filter((i) => i.description.trim());
  if (!items.length) return;
  const id = `${data.number.trim()}|${data.date}`;
  const entry: SavedInvoice = {
    id,
    number: data.number.trim(),
    date: data.date,
    buyerName: name,
    buyerTaxId: data.buyerTaxId.trim(),
    buyerAddress: data.buyerAddress.trim(),
    items,
    note: data.note,
    total: calcTotal(items),
    savedAt: now,
  };
  writeList(
    HISTORY_KEY,
    [entry, ...loadHistory().filter((h) => h.id !== id)].slice(0, MAX_HISTORY),
  );
}

/** Items with fresh ids, so a repeated invoice does not share React keys with the old one. */
export function cloneItems(items: InvoiceItem[]): InvoiceItem[] {
  return items.map((item) => ({ ...item, id: newId() }));
}
