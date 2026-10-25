/**
 * Landing headings for /invoice keyed by the `?kw=` param that Google Ads
 * keywords set in their final URL. Matching the H1 to the search query lifts
 * Ads landing-page relevance (Quality Score). Unknown or missing keys fall back
 * to the default heading, so organic traffic and old links are unaffected.
 */
export type InvoiceHeading = {
  /** Desktop + server-rendered H1. */
  h1: string;
  /** Short H1 for the mobile wizard header. */
  mobileH1: string;
};

export const DEFAULT_INVOICE_HEADING: InvoiceHeading = {
  h1: "Рахунок-фактура PDF для ФОП",
  mobileH1: "Рахунок-фактура PDF",
};

const HEADINGS: Record<string, InvoiceHeading> = {
  faktura: DEFAULT_INVOICE_HEADING,
  "faktura-online": {
    h1: "Рахунок-фактура онлайн для ФОП",
    mobileH1: "Рахунок-фактура онлайн",
  },
  oplata: {
    h1: "Рахунок на оплату онлайн для ФОП",
    mobileH1: "Рахунок на оплату",
  },
  online: {
    h1: "Рахунок онлайн для ФОП — PDF за 2 хвилини",
    mobileH1: "Рахунок онлайн",
  },
  vystavyty: {
    h1: "Виставити рахунок онлайн за 2 хвилини",
    mobileH1: "Виставити рахунок",
  },
  stvoryty: {
    h1: "Створити рахунок-фактуру онлайн",
    mobileH1: "Створити рахунок",
  },
};

export function resolveInvoiceHeading(kw: string | string[] | undefined): InvoiceHeading {
  const key = (Array.isArray(kw) ? kw[0] : kw)?.trim().toLowerCase();
  return (key && HEADINGS[key]) || DEFAULT_INVOICE_HEADING;
}
