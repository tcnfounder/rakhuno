import type { PDFFont, PDFImage, PDFPage, RGB } from "pdf-lib";
import {
  amountInWordsUk,
  calcLine,
  calcTotal,
  formatDateUk,
  parseAmount,
  type InvoiceData,
} from "./invoice";

/**
 * Invoice PDF drawn as real text (pdf-lib + Roboto with Cyrillic, subset into the file):
 * the IBAN and every other field can be selected and copied, the file stays small and sharp.
 * Same layout as the on-screen A4 sheet. The html2canvas capture in pdf.ts stays as a fallback.
 */

const A4 = { w: 595.28, h: 841.89 };
const M = 40; // page margin, pt
const BOTTOM = 48; // keep clear for the page footer
const FONT_URLS = { regular: "/fonts/pdf/Roboto-Regular.ttf", bold: "/fonts/pdf/Roboto-Bold.ttf" };

type Fonts = { regular: PDFFont; bold: PDFFont; chars: Set<number> };

let fontBytes: Promise<[ArrayBuffer, ArrayBuffer]> | null = null;

function loadFontBytes() {
  if (!fontBytes) {
    fontBytes = Promise.all(
      [FONT_URLS.regular, FONT_URLS.bold].map(async (url) => {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`font_${res.status}`);
        return res.arrayBuffer();
      }),
    ) as Promise<[ArrayBuffer, ArrayBuffer]>;
    fontBytes.catch(() => {
      fontBytes = null;
    });
  }
  return fontBytes;
}

/** «18 500,00»: grouped, two decimals, plain spaces (same on every device). */
export function money(n: number) {
  return new Intl.NumberFormat("uk-UA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    .format(n || 0)
    .replace(/[  ]/g, " ");
}

function groupIban(raw: string) {
  return raw.replace(/\s+/g, "").toUpperCase().replace(/(.{4})/g, "$1 ").trim();
}

function dataUrlBytes(dataUrl: string) {
  const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

export async function buildInvoiceVectorPdf(
  data: InvoiceData,
  qrDataUrl: string | null,
): Promise<{ blob: Blob; filename: string }> {
  const [{ PDFDocument, rgb }, fontkit, [regularBytes, boldBytes]] = await Promise.all([
    import("pdf-lib"),
    import("@pdf-lib/fontkit").then((m) => m.default),
    loadFontBytes(),
  ]);

  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const regular = await doc.embedFont(regularBytes, { subset: true });
  const bold = await doc.embedFont(boldBytes, { subset: true });
  const fonts: Fonts = { regular, bold, chars: new Set(regular.getCharacterSet()) };

  const INK = rgb(0.09, 0.09, 0.09);
  const GRAY = rgb(0.42, 0.42, 0.42);
  const LIGHT = rgb(0.6, 0.6, 0.6);
  const RULE = rgb(0.15, 0.15, 0.15);
  const FILL = rgb(0.95, 0.95, 0.95);

  /** Drop characters the font cannot draw (emoji etc.) instead of failing the whole PDF. */
  const clean = (s: string) =>
    Array.from(s.replace(/[  ]/g, " "))
      .filter((ch) => ch === " " || fonts.chars.has(ch.codePointAt(0)!))
      .join("");

  const width = (s: string, size: number, font: PDFFont) => font.widthOfTextAtSize(clean(s), size);

  function wrap(text: string, maxW: number, size: number, font: PDFFont): string[] {
    const out: string[] = [];
    for (const para of clean(text).split(/\r?\n/)) {
      let line = "";
      for (const word of para.split(/\s+/).filter(Boolean)) {
        const next = line ? `${line} ${word}` : word;
        if (font.widthOfTextAtSize(next, size) <= maxW) {
          line = next;
          continue;
        }
        if (line) out.push(line);
        // A single word wider than the column (long code, URL): hard-split it.
        let rest = word;
        while (font.widthOfTextAtSize(rest, size) > maxW && rest.length > 1) {
          let cut = rest.length - 1;
          while (cut > 1 && font.widthOfTextAtSize(rest.slice(0, cut), size) > maxW) cut--;
          out.push(rest.slice(0, cut));
          rest = rest.slice(cut);
        }
        line = rest;
      }
      out.push(line);
    }
    return out.length ? out : [""];
  }

  let page: PDFPage = doc.addPage([A4.w, A4.h]);
  const pages: PDFPage[] = [page];
  let y = M; // distance from the top edge

  const text = (
    s: string,
    x: number,
    top: number,
    size: number,
    font: PDFFont = regular,
    color: RGB = INK,
    align: "left" | "right" | "center" = "left",
  ) => {
    const str = clean(s);
    const w = font.widthOfTextAtSize(str, size);
    const dx = align === "right" ? -w : align === "center" ? -w / 2 : 0;
    // `top` is the top of the text line; baseline sits ~0.8 of the size below it.
    page.drawText(str, { x: x + dx, y: A4.h - top - size * 0.8, size, font, color });
  };
  const hline = (x1: number, x2: number, top: number, thickness = 0.75, color: RGB = RULE) =>
    page.drawLine({ start: { x: x1, y: A4.h - top }, end: { x: x2, y: A4.h - top }, thickness, color });
  const box = (x: number, top: number, w: number, h: number, fill?: RGB, border = 0.75) =>
    page.drawRectangle({
      x,
      y: A4.h - top - h,
      width: w,
      height: h,
      ...(fill ? { color: fill } : {}),
      borderColor: RULE,
      borderWidth: border,
    });
  const vline = (x: number, top: number, bottom: number) =>
    page.drawLine({ start: { x, y: A4.h - top }, end: { x, y: A4.h - bottom }, thickness: 0.75, color: RULE });

  const newPage = () => {
    page = doc.addPage([A4.w, A4.h]);
    pages.push(page);
    y = M;
  };
  const ensure = (h: number) => {
    if (y + h > A4.h - BOTTOM) newPage();
  };

  const contentW = A4.w - M * 2;
  const total = calcTotal(data.items);

  // ── Header ──────────────────────────────────────────────
  let logo: PDFImage | null = null;
  if (data.sellerLogo.startsWith("data:image/png")) logo = await doc.embedPng(dataUrlBytes(data.sellerLogo)).catch(() => null);
  else if (/^data:image\/jpe?g/.test(data.sellerLogo)) logo = await doc.embedJpg(dataUrlBytes(data.sellerLogo)).catch(() => null);
  if (logo) {
    const scale = Math.min(110 / logo.width, 32 / logo.height, 1);
    const lw = logo.width * scale;
    const lh = logo.height * scale;
    page.drawImage(logo, { x: M, y: A4.h - y - lh, width: lw, height: lh });
    y += lh + 8;
  }
  text("РАХУНОК-ПРОФОРМА", M, y, 14, bold);
  text("Не є податковою", A4.w - M, y, 7.5, regular, GRAY, "right");
  text("накладною", A4.w - M, y + 9.5, 7.5, regular, GRAY, "right");
  y += 24;
  text("№", M, y + 1, 10, bold);
  text(data.number || "—", M + 14, y, 11, bold);
  const numW = width(data.number || "—", 11, bold);
  text("від", M + 14 + numW + 16, y + 1, 10, bold);
  text(formatDateUk(data.date), M + 14 + numW + 36, y, 11);
  y += 18;
  hline(M, A4.w - M, y, 1.5);
  y += 12;

  // ── Parties ─────────────────────────────────────────────
  const colW = contentW / 2;
  const pad = 9;
  const innerW = colW - pad * 2;

  type Field = { label: string; value: string; size?: number; font?: PDFFont };
  const sellerFields: Field[] = [
    { label: "ФОП / НАЗВА", value: data.sellerName || "—", size: 11, font: bold },
    { label: "ІПН / ЄДРПОУ", value: data.sellerTaxId || "—" },
    { label: "АДРЕСА", value: data.sellerAddress || "—" },
    { label: "БАНК", value: data.sellerBank || "—" },
    { label: "IBAN", value: data.sellerIban ? groupIban(data.sellerIban) : "—" },
  ];
  const buyerFields: Field[] = [
    { label: "НАЗВА / ПІБ", value: data.buyerName || "—", size: 11, font: bold },
    { label: "ІПН / ЄДРПОУ", value: data.buyerTaxId || "—" },
    { label: "АДРЕСА", value: data.buyerAddress || "—" },
  ];
  const sellerNote = data.fopGroup
    ? `Платник єдиного податку, ${data.fopGroup} група. Без ПДВ.`
    : "Без ПДВ.";

  const fieldsHeight = (fields: Field[]) =>
    fields.reduce((h, f) => h + 9 + wrap(f.value, innerW, f.size || 9.5, f.font || regular).length * ((f.size || 9.5) + 3) + 4, 0);
  const sellerH = 16 + fieldsHeight(sellerFields) + 14;
  const buyerH = 16 + fieldsHeight(buyerFields);
  const partiesH = Math.max(sellerH, buyerH) + pad * 2;
  ensure(partiesH);
  box(M, y, contentW, partiesH);
  vline(M + colW, y, y + partiesH);

  const drawColumn = (x: number, title: string, fields: Field[], note?: string) => {
    let cy = y + pad;
    text(title, x + pad, cy, 7.5, bold, GRAY);
    cy += 16;
    for (const f of fields) {
      text(f.label, x + pad, cy, 6.5, bold, LIGHT);
      cy += 9;
      const size = f.size || 9.5;
      for (const line of wrap(f.value, innerW, size, f.font || regular)) {
        text(line, x + pad, cy, size, f.font || regular);
        cy += size + 3;
      }
      cy += 4;
    }
    if (note) text(note, x + pad, cy + 2, 7.5, regular, GRAY);
  };
  drawColumn(M, "ВИКОНАВЕЦЬ (ПОСТАЧАЛЬНИК)", sellerFields, sellerNote);
  drawColumn(M + colW, "ЗАМОВНИК (ПЛАТНИК)", buyerFields);
  y += partiesH + 16;

  // ── Items ───────────────────────────────────────────────
  const cols = [
    { key: "n", title: "№", w: 22, align: "center" as const },
    { key: "d", title: "Найменування", w: 0, align: "left" as const },
    { key: "u", title: "Од.", w: 48, align: "center" as const },
    { key: "q", title: "К-сть", w: 40, align: "right" as const },
    { key: "p", title: "Ціна", w: 64, align: "right" as const },
    { key: "s", title: "Сума", w: 74, align: "right" as const },
  ];
  cols[1].w = contentW - cols.reduce((s, c) => s + c.w, 0);
  const xs: number[] = [];
  cols.reduce((x, c) => (xs.push(x), x + c.w), M);
  const cellPad = 4;
  const rowSize = 8.5;

  const items = data.items.filter((i) => i.description.trim());
  text("ПЕРЕЛІК ТОВАРІВ / ПОСЛУГ", M, y, 7, bold, GRAY);
  y += 12;

  const drawHeader = () => {
    const h = 18;
    box(M, y, contentW, h, FILL);
    cols.forEach((c, i) => {
      if (i > 0) vline(xs[i], y, y + h);
      const tx = c.align === "right" ? xs[i] + c.w - cellPad : c.align === "center" ? xs[i] + c.w / 2 : xs[i] + cellPad;
      text(c.title, tx, y + 5, 8, bold, INK, c.align);
    });
    y += h;
  };
  ensure(18 + 22);
  drawHeader();

  items.forEach((item, index) => {
    const lines = wrap(item.description, cols[1].w - cellPad * 2, rowSize, regular);
    const h = Math.max(18, lines.length * (rowSize + 3) + 9);
    if (y + h > A4.h - BOTTOM) {
      newPage();
      drawHeader();
    }
    box(M, y, contentW, h);
    cols.forEach((_, i) => i > 0 && vline(xs[i], y, y + h));
    const cell = (i: number, value: string, color: RGB = INK) => {
      const c = cols[i];
      const tx = c.align === "right" ? xs[i] + c.w - cellPad : c.align === "center" ? xs[i] + c.w / 2 : xs[i] + cellPad;
      text(value, tx, y + 5, rowSize, regular, color, c.align);
    };
    cell(0, String(index + 1), GRAY);
    lines.forEach((line, li) => text(line, xs[1] + cellPad, y + 5 + li * (rowSize + 3), rowSize));
    cell(2, item.unit || "");
    cell(3, item.qty || "");
    cell(4, money(parseAmount(item.price)));
    cell(5, `${money(calcLine(item))} грн`);
    y += h;
  });

  // ── Total, amount in words ─────────────────────────────
  const words = `Сума прописом: ${amountInWordsUk(total)}`;
  const wordLines = wrap(words, contentW - 20, 8.5, regular);
  const totalH = 30 + wordLines.length * 11.5 + 10;
  ensure(totalH + 120);
  box(M, y, contentW, totalH);
  text("ВСЬОГО ДО СПЛАТИ", M + 10, y + 11, 9, bold);
  text(`${money(total)} грн`, A4.w - M - 10, y + 7, 15, bold, INK, "right");
  hline(M, A4.w - M, y + 30, 0.5, rgb(0.8, 0.8, 0.8));
  wordLines.forEach((line, i) => {
    const isFirst = i === 0;
    if (isFirst && line.startsWith("Сума прописом:")) {
      text("Сума прописом:", M + 10, y + 36, 8.5, bold);
      text(line.slice("Сума прописом:".length), M + 10 + width("Сума прописом:", 8.5, bold), y + 36, 8.5);
    } else {
      text(line, M + 10, y + 36 + i * 11.5, 8.5);
    }
  });
  y += totalH + 16;

  // ── Purpose + QR ───────────────────────────────────────
  const qrSize = 96;
  const purposeW = contentW - (qrDataUrl ? qrSize + 20 : 0);
  const noteLines = wrap(data.note || "—", purposeW, 10, regular);
  const qrCaption = wrap("Скануйте камерою або в застосунку банку, щоб оплатити", qrSize, 6.5, regular);
  const blockH = Math.max(14 + noteLines.length * 13, qrDataUrl ? qrSize + 6 + qrCaption.length * 8.5 : 0);
  ensure(blockH + 90);
  text("ПРИЗНАЧЕННЯ ПЛАТЕЖУ / УМОВИ ОПЛАТИ", M, y, 7, bold, GRAY);
  noteLines.forEach((line, i) => text(line, M, y + 14 + i * 13, 10));
  if (qrDataUrl) {
    const qr = await doc.embedPng(dataUrlBytes(qrDataUrl)).catch(() => null);
    if (qr) {
      const qx = A4.w - M - qrSize;
      page.drawImage(qr, { x: qx, y: A4.h - y - qrSize, width: qrSize, height: qrSize });
      qrCaption.forEach((line, i) => text(line, qx + qrSize / 2, y + qrSize + 5 + i * 8.5, 6.5, regular, GRAY, "center"));
    }
  }
  y += blockH + 22;

  // ── Signatures, footer ─────────────────────────────────
  const sigW = (contentW - 30) / 2;
  [M, M + sigW + 30].forEach((x, i) => {
    text(i === 0 ? "Виконавець" : "Замовник", x, y, 9, bold);
    hline(x, x + sigW, y + 34, 0.5, LIGHT);
    text("підпис / ПІБ", x, y + 24, 8, regular, GRAY);
  });
  y += 50;
  text("Сформовано через rakhuno.com. Не є податковою консультацією.", M, y, 6.5, regular, LIGHT);

  if (pages.length > 1) {
    pages.forEach((p, i) => {
      page = p;
      text(`Аркуш ${i + 1} з ${pages.length}`, A4.w / 2, A4.h - 28, 7.5, regular, LIGHT, "center");
    });
  }

  doc.setTitle(`Рахунок № ${data.number || "—"} від ${formatDateUk(data.date)}`);
  if (data.sellerName) doc.setAuthor(clean(data.sellerName));
  doc.setCreator("Rakhuno (rakhuno.com)");
  doc.setProducer("Rakhuno");

  const bytes = await doc.save();
  const safeNum = (data.number || "draft").replace(/[^\w\-]+/g, "_");
  return {
    blob: new Blob([bytes as BlobPart], { type: "application/pdf" }),
    filename: `rahunok-${safeNum}.pdf`,
  };
}
