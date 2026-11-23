import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { InvoiceData, formatDateUk } from "./invoice";

/** «18500» → «18 500,00»: prices print like the sums next to them. */
function formatMoneyPlain(raw: string) {
  const n = Number(raw.replace(/\s/g, "").replace(",", "."));
  if (!Number.isFinite(n)) return raw;
  return new Intl.NumberFormat("uk-UA", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

/** IBAN in groups of four, as banks print it. */
function groupIban(raw: string) {
  return raw.replace(/\s+/g, "").toUpperCase().replace(/(.{4})/g, "$1 ").trim();
}

/** jsPDF's built-in fonts have no Cyrillic, so the page footer is drawn as an image. */
function footerImage(text: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 600;
  canvas.height = 60;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#787878";
  ctx.font = "34px Arial, Helvetica, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  return canvas.toDataURL("image/png");
}

/** html2canvas clips <input>/<textarea> text — flatten to plain nodes first. */
function flattenFormControls(root: HTMLElement) {
  const controls = root.querySelectorAll("input, textarea, select");
  controls.forEach((el) => {
    const control = el as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    const replacement = document.createElement("div");
    let text = control.value || "";

    if (control instanceof HTMLInputElement && control.type === "date" && text) {
      text = formatDateUk(text);
    }
    if (control instanceof HTMLSelectElement) {
      text = control.options[control.selectedIndex]?.text || text;
    }

    const format = control.getAttribute("data-pdf-format");
    if (format === "money" && text) text = formatMoneyPlain(text);
    if (format === "iban" && text) text = groupIban(text);

    replacement.textContent = text || "—";
    const isCell = control.hasAttribute("data-pdf-cell");
    // Keep the field's own alignment (numbers right, units centred); a plain div would reset it.
    const align = getComputedStyle(control).textAlign;
    // Fields that sit side by side on one line (invoice № and date) keep their own width.
    const width = control.getBoundingClientRect().width;
    const parentWidth = control.parentElement?.getBoundingClientRect().width ?? width;
    const inline = width > 0 && width < parentWidth * 0.9;
    replacement.setAttribute(
      "style",
      [
        inline ? "display:inline-block" : "display:block",
        inline ? `width:${Math.ceil(width)}px` : "width:100%",
        "margin:0",
        isCell ? "padding:4px 6px" : "padding:4px 0",
        "border:0",
        // A finished document, not a filled-in form: no input underlines in the PDF.
        "border-bottom:0",
        `text-align:${align === "start" || !align ? "left" : align}`,
        "background:transparent",
        "color:#171717",
        "font:inherit",
        "font-size:inherit",
        "font-weight:inherit",
        "line-height:1.35",
        "letter-spacing:inherit",
        "white-space:pre-wrap",
        "word-break:break-word",
        "min-height:1.25em",
        "box-sizing:border-box",
      ].join(";"),
    );

    if (control.className.includes("font-mono")) {
      replacement.style.fontFamily = "ui-monospace, SFMono-Regular, Menlo, monospace";
      replacement.style.letterSpacing = "0.04em";
    }
    if (format === "iban") {
      // 34 characters with spaces: keep it on one line, a split IBAN is easy to mistype.
      replacement.style.whiteSpace = "nowrap";
      replacement.style.letterSpacing = "0";
      replacement.style.fontSize = "12.5px";
    }
    if (control.className.includes("text-xl") || control.className.includes("font-bold")) {
      replacement.style.fontSize = "16px";
      replacement.style.fontWeight = "700";
    } else if (control.className.includes("text-lg") || control.className.includes("font-semibold")) {
      replacement.style.fontSize = "17px";
      replacement.style.fontWeight = "600";
    }

    control.replaceWith(replacement);
  });

  root.querySelectorAll("button, [data-pdf-hide]").forEach((el) => {
    (el as HTMLElement).style.display = "none";
  });
}

function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export type PdfResult = {
  blob: Blob;
  filename: string;
};

/** Build A4 PDF from a document node (invoice or act); always returns a blob for re-download UI. */
export async function buildInvoicePdf(
  data: InvoiceData,
  node: HTMLElement,
  filePrefix = "rahunok",
): Promise<PdfResult> {
  const clone = node.cloneNode(true) as HTMLElement;
  // Exact A4 content width at 96dpi ≈ 794px for 210mm
  const a4WidthPx = 794;
  clone.style.position = "fixed";
  clone.style.left = "-10000px";
  clone.style.top = "0";
  clone.style.width = `${a4WidthPx}px`;
  clone.style.maxWidth = `${a4WidthPx}px`;
  clone.style.minHeight = "auto";
  clone.style.margin = "0";
  clone.style.borderRadius = "0";
  clone.style.boxShadow = "none";
  clone.style.zIndex = "-1";
  clone.style.pointerEvents = "none";
  clone.style.background = "#ffffff";
  document.body.appendChild(clone);

  flattenFormControls(clone);

  const SCALE = 2;
  // Where a page may end: below a table row or a block marked data-pdf-keep, so no row is cut in half.
  const top = clone.getBoundingClientRect().top;
  const cutPoints = Array.from(clone.querySelectorAll("tr, [data-pdf-keep]"))
    .map((el) => Math.round((el.getBoundingClientRect().bottom - top) * SCALE))
    .sort((a, b) => a - b);

  try {
    const canvas = await html2canvas(clone, {
      scale: SCALE,
      backgroundColor: "#ffffff",
      useCORS: true,
      allowTaint: true,
      logging: false,
      width: a4WidthPx,
      windowWidth: a4WidthPx,
      windowHeight: clone.scrollHeight,
    });

    const pdf = new jsPDF({ unit: "mm", format: "a4", compress: true });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const margin = 12;
    const usableW = pageW - margin * 2;
    const usableH = pageH - margin * 2;

    const imgW = usableW;
    const imgH = (canvas.height * imgW) / canvas.width;
    const imgData = canvas.toDataURL("image/jpeg", 0.92);

    if (imgH <= usableH) {
      pdf.addImage(imgData, "JPEG", margin, margin, imgW, imgH);
    } else {
      // Many line items → slice tall canvas across A4 pages + page index
      const pageCanvas = document.createElement("canvas");
      const pageCtx = pageCanvas.getContext("2d");
      if (!pageCtx) throw new Error("no_canvas");

      const slicePx = Math.floor((usableH / imgH) * canvas.height);
      // Plan the page breaks first, so «Аркуш N з M» knows M.
      const slices: { y: number; h: number }[] = [];
      for (let y = 0; y < canvas.height; ) {
        let h = Math.min(slicePx, canvas.height - y);
        if (y + h < canvas.height) {
          const cut = cutPoints.filter((c) => c > y + slicePx * 0.5 && c <= y + slicePx).pop();
          if (cut) h = cut - y;
        }
        slices.push({ y, h });
        y += h;
      }
      pageCanvas.width = canvas.width;
      slices.forEach(({ y, h }, page) => {
        pageCanvas.height = h;
        pageCtx.fillStyle = "#ffffff";
        pageCtx.fillRect(0, 0, pageCanvas.width, h);
        pageCtx.drawImage(canvas, 0, y, canvas.width, h, 0, 0, canvas.width, h);
        const sliceData = pageCanvas.toDataURL("image/jpeg", 0.92);
        const sliceHmm = (h * imgW) / canvas.width;
        if (page > 0) pdf.addPage();
        pdf.addImage(sliceData, "JPEG", margin, margin, imgW, sliceHmm);
        const footer = footerImage(`Аркуш ${page + 1} з ${slices.length}`);
        if (footer) pdf.addImage(footer, "PNG", pageW / 2 - 20, pageH - 9, 40, 4);
      });
    }

    const safeNum = (data.number || "draft").replace(/[^\w\-]+/g, "_");
    const filename = `${filePrefix}-${safeNum}.pdf`;
    const blob = pdf.output("blob");
    return { blob, filename };
  } finally {
    clone.remove();
  }
}

/**
 * Text PDF first (pdf-vector.ts: selectable, small); if it throws (font did not load, old
 * browser), the image capture of the on-screen sheet.
 */
export async function buildWithFallback(
  vector: (m: typeof import("./pdf-vector")) => Promise<PdfResult>,
  fallback: () => Promise<PdfResult>,
): Promise<PdfResult> {
  try {
    return await vector(await import("./pdf-vector"));
  } catch (e) {
    console.warn("[pdf] text PDF failed, using image capture", e);
    return fallback();
  }
}

export async function downloadInvoicePdf(
  data: InvoiceData,
  node: HTMLElement,
  qrDataUrl: string | null = null,
): Promise<PdfResult> {
  const result = await buildWithFallback(
    (m) => m.buildInvoiceVectorPdf(data, qrDataUrl),
    () => buildInvoicePdf(data, node),
  );
  triggerBlobDownload(result.blob, result.filename);
  return result;
}

export function downloadPdfBlob(blob: Blob, filename: string) {
  triggerBlobDownload(blob, filename);
}

/** A guide-page document (акт, накладна, акт звірки): text PDF, falling back to the capture of `node`. */
export async function downloadDocPdf(
  vector: (m: typeof import("./pdf-vector")) => Promise<PdfResult>,
  node: HTMLElement,
  filePrefix: string,
  number: string,
): Promise<PdfResult> {
  const result = await buildWithFallback(vector, () => buildInvoicePdf({ number } as InvoiceData, node, filePrefix));
  triggerBlobDownload(result.blob, result.filename);
  return result;
}
