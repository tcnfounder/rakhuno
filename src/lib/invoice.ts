export type InvoiceItem = {
  description: string;
  qty: number;
  price: number;
};

export type FopGroup = "2" | "3" | "";

export type InvoiceData = {
  number: string;
  date: string;
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
  "sellerName" | "sellerTaxId" | "sellerAddress" | "sellerIban" | "sellerBank" | "fopGroup"
>;

export const PROFILE_KEY = "rakhuno.seller.v1";
export const COUNTER_KEY = "rakhuno.invoiceCounter.v1";

export function emptyItem(): InvoiceItem {
  return { description: "", qty: 1, price: 0 };
}

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function calcTotal(items: InvoiceItem[]) {
  return items.reduce((sum, item) => sum + (Number(item.qty) || 0) * (Number(item.price) || 0), 0);
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
    const raw = window.localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SellerProfile;
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
  if (!data.buyerName.trim()) return "Вкажіть замовника.";
  const lines = data.items.filter((i) => i.description.trim());
  if (!lines.length) return "Додайте хоча б одну позицію з описом.";
  if (lines.some((i) => !(Number(i.qty) > 0) || !(Number(i.price) >= 0))) {
    return "Перевірте кількість і ціну в позиціях.";
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
