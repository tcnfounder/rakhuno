import type { PDFDocument, PDFFont, PDFImage, PDFPage, RGB } from "pdf-lib";
import {
  amountInWordsUk,
  calcLine,
  calcTotal,
  formatDateUk,
  parseAmount,
  type InvoiceData,
  type InvoiceItem,
} from "./invoice";

/**
 * Documents drawn as real text (pdf-lib + Roboto with Cyrillic, subset into the file): every
 * field can be selected and copied, files stay small and sharp. One small page engine (Sheet)
 * draws the invoice, the act and the видаткова накладна. The html2canvas capture in pdf.ts
 * stays as the fallback.
 */

const A4 = { w: 595.28, h: 841.89 };
const M = 40; // page margin, pt
const BOTTOM = 48; // keep clear for the page footer
const CONTENT_W = A4.w - M * 2;
const FONT_URLS = ["/fonts/pdf/Roboto-Regular.ttf", "/fonts/pdf/Roboto-Bold.ttf"];

export type VectorPdf = { blob: Blob; filename: string };

let fontBytes: Promise<ArrayBuffer[]> | null = null;

function loadFontBytes() {
  if (!fontBytes) {
    fontBytes = Promise.all(
      FONT_URLS.map(async (url) => {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`font_${res.status}`);
        return res.arrayBuffer();
      }),
    );
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

const BLANK = "____________________";

/** «ФОП Петренко П. П.» — users often type the name without the ФОП prefix. */
function fopName(name: string) {
  const n = name.trim();
  if (!n) return `ФОП ${BLANK}`;
  return /^фоп(\s|$)/i.test(n) ? n : `ФОП ${n}`;
}

function dataUrlBytes(dataUrl: string) {
  const bin = atob(dataUrl.slice(dataUrl.indexOf(",") + 1));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

type Align = "left" | "right" | "center";
type Column = { title: string; w: number; align: Align; color?: RGB };

// ── Page engine ──────────────────────────────────────────────────────────────

async function openSheet() {
  const [{ PDFDocument, rgb }, fontkit, [regularBytes, boldBytes]] = await Promise.all([
    import("pdf-lib"),
    import("@pdf-lib/fontkit").then((m) => m.default),
    loadFontBytes(),
  ]);
  const doc: PDFDocument = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const regular = await doc.embedFont(regularBytes, { subset: true });
  const bold = await doc.embedFont(boldBytes, { subset: true });
  const chars = new Set(regular.getCharacterSet());

  const C = {
    ink: rgb(0.09, 0.09, 0.09),
    gray: rgb(0.42, 0.42, 0.42),
    light: rgb(0.6, 0.6, 0.6),
    rule: rgb(0.15, 0.15, 0.15),
    soft: rgb(0.8, 0.8, 0.8),
    fill: rgb(0.95, 0.95, 0.95),
  };

  const pages: PDFPage[] = [doc.addPage([A4.w, A4.h])];
  let page = pages[0];
  const s = {
    doc,
    regular,
    bold,
    C,
    /** Distance from the top edge of the current page. */
    y: M,

    /** Drop characters the font cannot draw (emoji etc.) instead of failing the whole PDF. */
    clean(str: string) {
      return Array.from(str.replace(/[  ]/g, " "))
        .filter((ch) => ch === " " || chars.has(ch.codePointAt(0)!))
        .join("");
    },
    width(str: string, size: number, font: PDFFont = regular) {
      return font.widthOfTextAtSize(s.clean(str), size);
    },
    wrap(text: string, maxW: number, size: number, font: PDFFont = regular): string[] {
      const out: string[] = [];
      for (const para of s.clean(text).split(/\r?\n/)) {
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
    },
    /** `top` is the top of the text line; the baseline sits ~0.8 of the size below it. */
    text(str: string, x: number, top: number, size: number, font: PDFFont = regular, color: RGB = C.ink, align: Align = "left") {
      const t = s.clean(str);
      const w = font.widthOfTextAtSize(t, size);
      const dx = align === "right" ? -w : align === "center" ? -w / 2 : 0;
      page.drawText(t, { x: x + dx, y: A4.h - top - size * 0.8, size, font, color });
    },
    hline(x1: number, x2: number, top: number, thickness = 0.75, color: RGB = C.rule) {
      page.drawLine({ start: { x: x1, y: A4.h - top }, end: { x: x2, y: A4.h - top }, thickness, color });
    },
    vline(x: number, top: number, bottom: number) {
      page.drawLine({ start: { x, y: A4.h - top }, end: { x, y: A4.h - bottom }, thickness: 0.75, color: C.rule });
    },
    box(x: number, top: number, w: number, h: number, fill?: RGB) {
      page.drawRectangle({ x, y: A4.h - top - h, width: w, height: h, ...(fill ? { color: fill } : {}), borderColor: C.rule, borderWidth: 0.75 });
    },
    image(img: PDFImage, x: number, top: number, w: number, h: number) {
      page.drawImage(img, { x, y: A4.h - top - h, width: w, height: h });
    },
    newPage() {
      page = doc.addPage([A4.w, A4.h]);
      pages.push(page);
      s.y = M;
    },
    /** Starts a new page when `h` more points would run into the footer. */
    ensure(h: number) {
      if (s.y + h > A4.h - BOTTOM) s.newPage();
    },
    /** Wrapped paragraph across the content width; breaks pages between lines. */
    paragraph(str: string, size = 10, font: PDFFont = regular, color: RGB = C.ink, align: Align = "left") {
      const lh = size * 1.4;
      for (const line of s.wrap(str, CONTENT_W, size, font)) {
        s.ensure(lh);
        const x = align === "right" ? A4.w - M : align === "center" ? A4.w / 2 : M;
        s.text(line, x, s.y, size, font, color, align);
        s.y += lh;
      }
    },
    /** Bordered table, full content width; the flexible column (w: 0) takes the rest. Header repeats on each page. */
    table(cols: Column[], rows: string[][], size = 8.5) {
      const fixed = cols.reduce((sum, c) => sum + c.w, 0);
      const widths = cols.map((c) => (c.w ? c.w : CONTENT_W - fixed));
      const xs: number[] = [];
      widths.reduce((x, w) => (xs.push(x), x + w), M);
      const pad = 4;
      const flex = cols.findIndex((c) => !c.w);
      const tx = (i: number) =>
        cols[i].align === "right" ? xs[i] + widths[i] - pad : cols[i].align === "center" ? xs[i] + widths[i] / 2 : xs[i] + pad;

      const header = () => {
        const h = 18;
        s.box(M, s.y, CONTENT_W, h, C.fill);
        cols.forEach((c, i) => {
          if (i > 0) s.vline(xs[i], s.y, s.y + h);
          s.text(c.title, tx(i), s.y + 5, 8, bold, C.ink, c.align);
        });
        s.y += h;
      };
      s.ensure(18 + 22);
      header();
      for (const row of rows) {
        const lines = s.wrap(row[flex] ?? "", widths[flex] - pad * 2, size);
        const h = Math.max(18, lines.length * (size + 3) + 9);
        if (s.y + h > A4.h - BOTTOM) {
          s.newPage();
          header();
        }
        s.box(M, s.y, CONTENT_W, h);
        cols.forEach((c, i) => {
          if (i > 0) s.vline(xs[i], s.y, s.y + h);
          if (i === flex) lines.forEach((line, li) => s.text(line, tx(i), s.y + 5 + li * (size + 3), size));
          else s.text(row[i] ?? "", tx(i), s.y + 5, size, regular, c.color || C.ink, c.align);
        });
        s.y += h;
      }
    },
    /** Two signature blocks side by side; each has a bold title, a few lines and a signature rule. */
    signatures(left: { title: string; lines: string[]; caption: string }, right: { title: string; lines: string[]; caption: string }) {
      const colW = (CONTENT_W - 30) / 2;
      const blocks = [left, right];
      const heights = blocks.map((b) => 14 + b.lines.reduce((h, l) => h + s.wrap(l, colW, 9.5).length * 13, 0) + 40);
      s.ensure(Math.max(...heights) + 10);
      const top = s.y;
      blocks.forEach((b, i) => {
        const x = M + i * (colW + 30);
        let y = top;
        s.text(b.title, x, y, 9.5, bold);
        y += 14;
        for (const l of b.lines) {
          for (const w of s.wrap(l, colW, 9.5)) {
            s.text(w, x, y, 9.5);
            y += 13;
          }
        }
        const lineY = top + Math.max(...heights) - 14;
        s.hline(x, x + colW, lineY, 0.5, C.light);
        s.text(b.caption, x, lineY + 3, 7.5, regular, C.gray);
      });
      s.y = top + Math.max(...heights) + 10;
    },
    async finish(title: string, author: string, filename: string): Promise<VectorPdf> {
      if (pages.length > 1) {
        pages.forEach((p, i) => {
          page = p;
          s.text(`Аркуш ${i + 1} з ${pages.length}`, A4.w / 2, A4.h - 28, 7.5, regular, C.light, "center");
        });
      }
      doc.setTitle(s.clean(title));
      if (author.trim()) doc.setAuthor(s.clean(author));
      doc.setCreator("Rakhuno (rakhuno.com)");
      doc.setProducer("Rakhuno");
      const bytes = await doc.save();
      return { blob: new Blob([bytes as BlobPart], { type: "application/pdf" }), filename };
    },
  };
  return s;
}

type Sheet = Awaited<ReturnType<typeof openSheet>>;

const fileNumber = (number: string) => (number || "draft").replace(/[^\w\-]+/g, "_");

/** Same columns in the act and the накладна. */
function itemTable(sheet: Sheet, items: InvoiceItem[], nameTitle: string) {
  const rows = items.map((item, i) => [
    String(i + 1),
    item.description || "—",
    item.unit || "",
    item.qty || "",
    money(parseAmount(item.price)),
    money(calcLine(item)),
  ]);
  sheet.table(
    [
      { title: "№", w: 22, align: "center", color: sheet.C.gray },
      { title: nameTitle, w: 0, align: "left" },
      { title: "Од.", w: 48, align: "center" },
      { title: "К-сть", w: 40, align: "right" },
      { title: "Ціна, грн", w: 66, align: "right" },
      { title: "Сума, грн", w: 76, align: "right" },
    ],
    rows,
    9,
  );
}

const usedItems = (items: InvoiceItem[]) => items.filter((i) => i.description.trim() || calcLine(i) > 0);

// ── Invoice ──────────────────────────────────────────────────────────────────

export async function buildInvoiceVectorPdf(data: InvoiceData, qrDataUrl: string | null): Promise<VectorPdf> {
  const s = await openSheet();
  const { regular, bold, C } = s;
  const total = calcTotal(data.items);

  // Header
  let logo: PDFImage | null = null;
  if (data.sellerLogo.startsWith("data:image/png")) logo = await s.doc.embedPng(dataUrlBytes(data.sellerLogo)).catch(() => null);
  else if (/^data:image\/jpe?g/.test(data.sellerLogo)) logo = await s.doc.embedJpg(dataUrlBytes(data.sellerLogo)).catch(() => null);
  if (logo) {
    const scale = Math.min(110 / logo.width, 32 / logo.height, 1);
    s.image(logo, M, s.y, logo.width * scale, logo.height * scale);
    s.y += logo.height * scale + 8;
  }
  s.text("РАХУНОК-ПРОФОРМА", M, s.y, 14, bold);
  s.text("Не є податковою", A4.w - M, s.y, 7.5, regular, C.gray, "right");
  s.text("накладною", A4.w - M, s.y + 9.5, 7.5, regular, C.gray, "right");
  s.y += 24;
  s.text("№", M, s.y + 1, 10, bold);
  s.text(data.number || "—", M + 14, s.y, 11, bold);
  const numW = s.width(data.number || "—", 11, bold);
  s.text("від", M + 14 + numW + 16, s.y + 1, 10, bold);
  s.text(formatDateUk(data.date), M + 14 + numW + 36, s.y, 11);
  s.y += 18;
  s.hline(M, A4.w - M, s.y, 1.5);
  s.y += 12;

  // Parties
  const colW = CONTENT_W / 2;
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
  const sellerNote = data.fopGroup ? `Платник єдиного податку, ${data.fopGroup} група. Без ПДВ.` : "Без ПДВ.";
  const fieldsHeight = (fields: Field[]) =>
    fields.reduce((h, f) => h + 9 + s.wrap(f.value, innerW, f.size || 9.5, f.font || regular).length * ((f.size || 9.5) + 3) + 4, 0);
  const partiesH = Math.max(16 + fieldsHeight(sellerFields) + 14, 16 + fieldsHeight(buyerFields)) + pad * 2;
  s.ensure(partiesH);
  s.box(M, s.y, CONTENT_W, partiesH);
  s.vline(M + colW, s.y, s.y + partiesH);
  const drawColumn = (x: number, title: string, fields: Field[], note?: string) => {
    let cy = s.y + pad;
    s.text(title, x + pad, cy, 7.5, bold, C.gray);
    cy += 16;
    for (const f of fields) {
      s.text(f.label, x + pad, cy, 6.5, bold, C.light);
      cy += 9;
      const size = f.size || 9.5;
      for (const line of s.wrap(f.value, innerW, size, f.font || regular)) {
        s.text(line, x + pad, cy, size, f.font || regular);
        cy += size + 3;
      }
      cy += 4;
    }
    if (note) s.text(note, x + pad, cy + 2, 7.5, regular, C.gray);
  };
  drawColumn(M, "ВИКОНАВЕЦЬ (ПОСТАЧАЛЬНИК)", sellerFields, sellerNote);
  drawColumn(M + colW, "ЗАМОВНИК (ПЛАТНИК)", buyerFields);
  s.y += partiesH + 16;

  // Items
  s.text("ПЕРЕЛІК ТОВАРІВ / ПОСЛУГ", M, s.y, 7, bold, C.gray);
  s.y += 12;
  const items = data.items.filter((i) => i.description.trim());
  s.table(
    [
      { title: "№", w: 22, align: "center", color: C.gray },
      { title: "Найменування", w: 0, align: "left" },
      { title: "Од.", w: 48, align: "center" },
      { title: "К-сть", w: 40, align: "right" },
      { title: "Ціна", w: 64, align: "right" },
      { title: "Сума", w: 74, align: "right" },
    ],
    items.map((item, i) => [
      String(i + 1),
      item.description,
      item.unit || "",
      item.qty || "",
      money(parseAmount(item.price)),
      `${money(calcLine(item))} грн`,
    ]),
  );

  // Total, amount in words
  const label = "Сума прописом:";
  const wordLines = s.wrap(`${label} ${amountInWordsUk(total)}`, CONTENT_W - 20, 8.5);
  const totalH = 30 + wordLines.length * 11.5 + 10;
  s.ensure(totalH + 120);
  s.box(M, s.y, CONTENT_W, totalH);
  s.text("ВСЬОГО ДО СПЛАТИ", M + 10, s.y + 11, 9, bold);
  s.text(`${money(total)} грн`, A4.w - M - 10, s.y + 7, 15, bold, C.ink, "right");
  s.hline(M, A4.w - M, s.y + 30, 0.5, C.soft);
  wordLines.forEach((line, i) => {
    if (i === 0 && line.startsWith(label)) {
      s.text(label, M + 10, s.y + 36, 8.5, bold);
      s.text(line.slice(label.length), M + 10 + s.width(label, 8.5, bold), s.y + 36, 8.5);
    } else {
      s.text(line, M + 10, s.y + 36 + i * 11.5, 8.5);
    }
  });
  s.y += totalH + 16;

  // Purpose + QR
  const qrSize = 96;
  const purposeW = CONTENT_W - (qrDataUrl ? qrSize + 20 : 0);
  const noteLines = s.wrap(data.note || "—", purposeW, 10);
  const qrCaption = s.wrap("Скануйте камерою або в застосунку банку, щоб оплатити", qrSize, 6.5);
  const blockH = Math.max(14 + noteLines.length * 13, qrDataUrl ? qrSize + 6 + qrCaption.length * 8.5 : 0);
  s.ensure(blockH + 90);
  s.text("ПРИЗНАЧЕННЯ ПЛАТЕЖУ / УМОВИ ОПЛАТИ", M, s.y, 7, bold, C.gray);
  noteLines.forEach((line, i) => s.text(line, M, s.y + 14 + i * 13, 10));
  if (qrDataUrl) {
    const qr = await s.doc.embedPng(dataUrlBytes(qrDataUrl)).catch(() => null);
    if (qr) {
      const qx = A4.w - M - qrSize;
      s.image(qr, qx, s.y, qrSize, qrSize);
      qrCaption.forEach((line, i) => s.text(line, qx + qrSize / 2, s.y + qrSize + 5 + i * 8.5, 6.5, regular, C.gray, "center"));
    }
  }
  s.y += blockH + 22;

  // Signatures, footer
  const sigW = (CONTENT_W - 30) / 2;
  [M, M + sigW + 30].forEach((x, i) => {
    s.text(i === 0 ? "Виконавець" : "Замовник", x, s.y, 9, bold);
    s.hline(x, x + sigW, s.y + 34, 0.5, C.light);
    s.text("підпис / ПІБ", x, s.y + 24, 8, regular, C.gray);
  });
  s.y += 50;
  s.text("Сформовано через rakhuno.com. Не є податковою консультацією.", M, s.y, 6.5, regular, C.light);

  return s.finish(
    `Рахунок № ${data.number || "—"} від ${formatDateUk(data.date)}`,
    data.sellerName,
    `rahunok-${fileNumber(data.number)}.pdf`,
  );
}

// ── Act of completed work ────────────────────────────────────────────────────

/** `basis`: undefined links the act to the invoice; "" leaves it out; otherwise «згідно з …». */
export async function buildActVectorPdf(data: InvoiceData, actDate: string, basis?: string): Promise<VectorPdf> {
  const s = await openSheet();
  const { bold, C } = s;
  const items = usedItems(data.items);
  const total = calcTotal(items);
  const buyer = data.buyerName.trim() || BLANK;

  s.text(`АКТ № ${data.number || "—"}`, A4.w / 2, s.y, 14, bold, C.ink, "center");
  s.y += 20;
  s.text("приймання-передачі наданих послуг (виконаних робіт)", A4.w / 2, s.y, 11, bold, C.ink, "center");
  s.y += 18;
  s.text(`від ${formatDateUk(actDate)}`, A4.w - M, s.y, 10, s.regular, C.ink, "right");
  s.y += 24;

  const basisText =
    basis === undefined
      ? ` згідно з рахунком-фактурою № ${data.number || "—"} від ${formatDateUk(data.date)}`
      : basis.trim()
        ? ` згідно з ${basis.trim()}`
        : "";
  s.paragraph(
    `Ми, що нижче підписалися, Виконавець — ${fopName(data.sellerName)}` +
      `${data.sellerTaxId ? `, РНОКПП ${data.sellerTaxId}` : ""}, з одного боку, і Замовник — ${buyer}` +
      `${data.buyerTaxId ? `, код ${data.buyerTaxId}` : ""}, з іншого боку, склали цей акт про те, що Виконавець ` +
      `надав (виконав), а Замовник прийняв такі послуги (роботи)${basisText}:`,
  );
  s.y += 6;

  itemTable(s, items, "Найменування послуги (роботи)");
  s.y += 10;
  s.ensure(16);
  s.text(`Загальна вартість: ${money(total)} грн`, A4.w - M, s.y, 10.5, bold, C.ink, "right");
  s.y += 20;
  s.paragraph(
    `Сума прописом: ${amountInWordsUk(total)}` +
      `${data.fopGroup ? `. Виконавець — платник єдиного податку ${data.fopGroup} групи` : ""}. Без ПДВ.`,
  );
  s.y += 4;
  s.paragraph("Послуги надані (роботи виконані) в повному обсязі та в строк. Сторони претензій одна до одної не мають.");
  s.y += 26;

  s.signatures(
    {
      title: "Виконавець",
      lines: [
        fopName(data.sellerName),
        ...(data.sellerTaxId ? [`РНОКПП ${data.sellerTaxId}`] : []),
        ...(data.sellerIban ? [`IBAN ${groupIban(data.sellerIban)}`] : []),
      ],
      caption: "підпис",
    },
    {
      title: "Замовник",
      lines: [buyer, ...(data.buyerTaxId ? [`Код ${data.buyerTaxId}`] : []), ...(data.buyerAddress ? [data.buyerAddress] : [])],
      caption: "підпис, ПІБ",
    },
  );

  return s.finish(`Акт № ${data.number || "—"} від ${formatDateUk(actDate)}`, data.sellerName, `akt-${fileNumber(data.number)}.pdf`);
}

// ── Видаткова накладна ───────────────────────────────────────────────────────

export type NakladnaPdfData = {
  number: string;
  date: string;
  sellerName: string;
  sellerTaxId: string;
  buyerName: string;
  buyerTaxId: string;
  basis: string;
  items: InvoiceItem[];
};

export async function buildNakladnaVectorPdf(data: NakladnaPdfData): Promise<VectorPdf> {
  const s = await openSheet();
  const { bold, regular, C } = s;
  const items = usedItems(data.items);
  const total = calcTotal(items);
  const buyer = data.buyerName.trim() || BLANK;

  s.text(`ВИДАТКОВА НАКЛАДНА № ${data.number || "—"}`, A4.w / 2, s.y, 14, bold, C.ink, "center");
  s.y += 20;
  s.text(`від ${formatDateUk(data.date)}`, A4.w / 2, s.y, 10, regular, C.ink, "center");
  s.y += 26;

  const labelW = 90;
  const rows: [string, string][] = [
    ["Постачальник:", `${fopName(data.sellerName)}${data.sellerTaxId ? `, РНОКПП ${data.sellerTaxId}` : ""}`],
    ["Покупець:", `${buyer}${data.buyerTaxId ? `, код ${data.buyerTaxId}` : ""}`],
    ["Підстава:", data.basis.trim() || BLANK],
  ];
  for (const [label, value] of rows) {
    const lines = s.wrap(value, CONTENT_W - labelW, 10);
    s.ensure(lines.length * 14 + 4);
    s.text(label, M, s.y, 10, bold);
    lines.forEach((line, i) => s.text(line, M + labelW, s.y + i * 14, 10));
    s.y += lines.length * 14 + 4;
  }
  s.y += 8;

  itemTable(s, items, "Найменування товару");
  s.y += 10;
  s.ensure(16);
  s.text(`Разом: ${money(total)} грн`, A4.w - M, s.y, 10.5, bold, C.ink, "right");
  s.y += 20;
  s.paragraph(`Сума прописом: ${amountInWordsUk(total)}. Без ПДВ.`);
  s.y += 26;

  s.signatures(
    { title: "Відвантажив", lines: [fopName(data.sellerName)], caption: "підпис" },
    { title: "Отримав", lines: [buyer], caption: "підпис, ПІБ" },
  );

  return s.finish(
    `Видаткова накладна № ${data.number || "—"} від ${formatDateUk(data.date)}`,
    data.sellerName,
    `nakladna-${fileNumber(data.number)}.pdf`,
  );
}
