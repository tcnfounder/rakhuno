export type InvoiceItem = {
  id: string;
  description: string;
  /** Unit label, e.g. шт., послуга, год. */
  unit: string;
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
  return {
    id: stableId || newId(),
    description: "",
    unit: "послуга",
    qty: "1",
    price: "",
  };
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
    `Рахунок-проформа №${data.number || "—"} від ${formatDateUk(data.date)}`,
    `Отримувач: ${data.sellerName || "—"}`,
    data.sellerTaxId ? `ІПН/ЄДРПОУ: ${data.sellerTaxId}` : null,
    data.sellerIban ? `IBAN: ${data.sellerIban}` : null,
    data.sellerBank ? `Банк: ${data.sellerBank}` : null,
    `Сума: ${total}`,
    data.note ? `Призначення / умови: ${data.note}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

/** Amount in Ukrainian words for proforma footer (грн + коп.). */
export function amountInWordsUk(value: number): string {
  const safe = Math.max(0, Math.round(value * 100) / 100);
  const hryvni = Math.floor(safe);
  const kopiyky = Math.round((safe - hryvni) * 100);

  const ones = [
    "",
    "одна",
    "дві",
    "три",
    "чотири",
    "пʼять",
    "шість",
    "сім",
    "вісім",
    "девʼять",
  ];
  const onesM = [
    "",
    "один",
    "два",
    "три",
    "чотири",
    "пʼять",
    "шість",
    "сім",
    "вісім",
    "девʼять",
  ];
  const teens = [
    "десять",
    "одинадцять",
    "дванадцять",
    "тринадцять",
    "чотирнадцять",
    "пʼятнадцять",
    "шістнадцять",
    "сімнадцять",
    "вісімнадцять",
    "девʼятнадцять",
  ];
  const tens = [
    "",
    "",
    "двадцять",
    "тридцять",
    "сорок",
    "пʼятдесят",
    "шістдесят",
    "сімдесят",
    "вісімдесят",
    "девʼяносто",
  ];
  const hundreds = [
    "",
    "сто",
    "двісті",
    "триста",
    "чотириста",
    "пʼятсот",
    "шістсот",
    "сімсот",
    "вісімсот",
    "девʼятсот",
  ];

  function triad(n: number, feminine: boolean): string {
    const h = Math.floor(n / 100);
    const t = Math.floor((n % 100) / 10);
    const o = n % 10;
    const parts: string[] = [];
    if (h) parts.push(hundreds[h]);
    if (t === 1) {
      parts.push(teens[o]);
    } else {
      if (t) parts.push(tens[t]);
      if (o) parts.push((feminine ? ones : onesM)[o]);
    }
    return parts.join(" ");
  }

  function plural(n: number, one: string, few: string, many: string) {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return one;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
    return many;
  }

  if (hryvni === 0) {
    const kopWord = plural(kopiyky, "копійка", "копійки", "копійок");
    return `нуль гривень ${String(kopiyky).padStart(2, "0")} ${kopWord}`;
  }

  const millions = Math.floor(hryvni / 1_000_000);
  const thousands = Math.floor((hryvni % 1_000_000) / 1000);
  const rest = hryvni % 1000;
  const chunks: string[] = [];

  if (millions) {
    chunks.push(
      `${triad(millions, false)} ${plural(millions, "мільйон", "мільйони", "мільйонів")}`,
    );
  }
  if (thousands) {
    chunks.push(
      `${triad(thousands, true)} ${plural(thousands, "тисяча", "тисячі", "тисяч")}`,
    );
  }
  if (rest || (!millions && !thousands)) {
    chunks.push(triad(rest, false) || "нуль");
  }

  const hrWord = plural(hryvni, "гривня", "гривні", "гривень");
  const kopWord = plural(kopiyky, "копійка", "копійки", "копійок");
  const body = chunks.join(" ").replace(/\s+/g, " ").trim();
  const capitalized = body.charAt(0).toUpperCase() + body.slice(1);
  return `${capitalized} ${hrWord} ${String(kopiyky).padStart(2, "0")} ${kopWord}`;
}
