export type InvoiceItem = {
  id: string;
  description: string;
  qty: string;
  price: string;
};

export type FopGroup = "2" | "3" | "";

export type InvoiceData = {
  number: string;
  date: string;
  /** Optional FOP logo as data URL (aspect preserved, stored locally). */
  sellerLogo: string;
  sellerName: string;
  sellerTaxId: string;
  sellerAddress: string;
  sellerIban: string;
  sellerBank: string;
  buyerName: string;
  buyerTaxId: string;
  buyerAddress: string;
  items: InvoiceItem[];
  note: string;
  fopGroup: FopGroup;
};

export type SellerProfile = Pick<
  InvoiceData,
  | "sellerLogo"
  | "sellerName"
  | "sellerTaxId"
  | "sellerAddress"
  | "sellerIban"
  | "sellerBank"
  | "fopGroup"
>;

export const PROFILE_KEY = "rakhuno.seller.v2";
export const COUNTER_KEY = "rakhuno.invoiceCounter.v1";

let idSeq = 0;
export function newId() {
  idSeq += 1;
  // Prefer crypto when available (client); avoid Date.now() in first paint
  // so SSR markup matches hydration.
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `s${idSeq}`;
  return `line-${rand}`;
}

export function emptyItem(stableId?: string): InvoiceItem {
  return { id: stableId || newId(), description: "", qty: "1", price: "" };
}

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function parseAmount(value: string) {
  const normalized = value.replace(/\s/g, "").replace(",", ".");
  if (!normalized) return 0;
  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
}

export function calcLine(item: InvoiceItem) {
  return parseAmount(item.qty) * parseAmount(item.price);
}

export function calcTotal(items: InvoiceItem[]) {
  return items.reduce((sum, item) => sum + calcLine(item), 0);
}

export function formatUah(value: number) {
  return new Intl.NumberFormat("uk-UA", {
    style: "currency",
    currency: "UAH",
    maximumFractionDigits: 2,
  }).format(value || 0);
}

export function formatDateUk(iso: string) {
  if (!iso) return "—";
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

export function formatIban(raw: string) {
  const clean = raw.replace(/\s+/g, "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 34);
  return clean.replace(/(.{4})/g, "$1 ").trim();
}

export function formatTaxId(raw: string) {
  return raw.replace(/\D/g, "").slice(0, 10);
}

export function nextInvoiceNumber(): string {
  if (typeof window === "undefined") return "1";
  try {
    const raw = window.localStorage.getItem(COUNTER_KEY);
    const n = Math.max(1, Number(raw) || 1);
    return String(n);
  } catch {
    return "1";
  }
}

export function bumpInvoiceCounter(usedNumber: string) {
  if (typeof window === "undefined") return;
  const used = Number(usedNumber);
  const base = Number.isFinite(used) && used > 0 ? used : 0;
  try {
    const current = Number(window.localStorage.getItem(COUNTER_KEY) || "1");
    const next = Math.max(current, base) + 1;
    window.localStorage.setItem(COUNTER_KEY, String(next));
  } catch {
    /* ignore */
  }
}

export function loadSellerProfile(): Partial<SellerProfile> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw =
      window.localStorage.getItem(PROFILE_KEY) ||
      window.localStorage.getItem("rakhuno.seller.v1");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SellerProfile>;
    return {
      sellerLogo: typeof parsed.sellerLogo === "string" ? parsed.sellerLogo : "",
      sellerName: parsed.sellerName || "",
      sellerTaxId: parsed.sellerTaxId || "",
      sellerAddress: parsed.sellerAddress || "",
      sellerIban: parsed.sellerIban || "",
      sellerBank: parsed.sellerBank || "",
      fopGroup: parsed.fopGroup || "",
    };
  } catch {
    return null;
  }
}

export function saveSellerProfile(data: SellerProfile) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

export function validateInvoice(data: InvoiceData): string | null {
  if (!data.sellerName.trim()) return "Вкажіть ПІБ ФОП (виконавець).";
  if (!data.sellerIban.trim() || data.sellerIban.replace(/\s/g, "").length < 15) {
    return "Вкажіть IBAN для оплати.";
  }
  if (!data.buyerName.trim()) return "Вкажіть замовника.";
  const lines = data.items.filter((i) => i.description.trim());
  if (!lines.length) return "Додайте хоча б одну позицію з описом.";
  for (const line of lines) {
    if (!(parseAmount(line.qty) > 0)) return "Кількість має бути більше 0.";
    if (line.price.trim() === "" || parseAmount(line.price) < 0) {
      return "Вкажіть ціну для кожної позиції.";
    }
  }
  return null;
}

export function paymentText(data: InvoiceData) {
  const total = formatUah(calcTotal(data.items));
  return [
    `Рахунок №${data.number || "—"} від ${formatDateUk(data.date)}`,
    `Отримувач: ${data.sellerName || "—"}`,
    data.sellerTaxId ? `ІПН/ЄДРПОУ: ${data.sellerTaxId}` : null,
    data.sellerIban ? `IBAN: ${data.sellerIban}` : null,
    data.sellerBank ? `Банк: ${data.sellerBank}` : null,
    `Сума: ${total}`,
    data.note ? `Примітка: ${data.note}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}
