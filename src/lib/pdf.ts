import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { InvoiceData, formatDateUk } from "./invoice";

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

    replacement.textContent = text || "—";
    const isCell = control.hasAttribute("data-pdf-cell");
    replacement.setAttribute(
      "style",
      [
        "display:block",
        "width:100%",
        "margin:0",
        isCell ? "padding:4px 6px" : "padding:4px 0",
        "border:0",
        isCell ? "border-bottom:0" : "border-bottom:1px solid #d4d4d4",
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
    if (control.className.includes("text-xl") || control.className.includes("font-bold")) {
      replacement.style.fontSize = "20px";
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

/** Build A4 PDF from the live invoice node; always returns a blob for re-download UI. */
export async function buildInvoicePdf(data: InvoiceData, node: HTMLElement): Promise<PdfResult> {
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

  try {
    const canvas = await html2canvas(clone, {
      scale: 2,
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
      // Slice tall canvas across A4 pages
      const pageCanvas = document.createElement("canvas");
      const pageCtx = pageCanvas.getContext("2d");
      if (!pageCtx) throw new Error("no_canvas");

      const slicePx = Math.floor((usableH / imgH) * canvas.height);
      pageCanvas.width = canvas.width;
      let y = 0;
      let page = 0;
      while (y < canvas.height) {
        const h = Math.min(slicePx, canvas.height - y);
        pageCanvas.height = h;
        pageCtx.fillStyle = "#ffffff";
        pageCtx.fillRect(0, 0, pageCanvas.width, h);
        pageCtx.drawImage(canvas, 0, y, canvas.width, h, 0, 0, canvas.width, h);
        const sliceData = pageCanvas.toDataURL("image/jpeg", 0.92);
        const sliceHmm = (h * imgW) / canvas.width;
        if (page > 0) pdf.addPage();
        pdf.addImage(sliceData, "JPEG", margin, margin, imgW, sliceHmm);
        y += h;
        page += 1;
      }
    }

    const safeNum = (data.number || "draft").replace(/[^\w\-]+/g, "_");
    const filename = `rahunok-${safeNum}.pdf`;
    const blob = pdf.output("blob");
    return { blob, filename };
  } finally {
    clone.remove();
  }
}

export async function downloadInvoicePdf(data: InvoiceData, node: HTMLElement): Promise<PdfResult> {
  const result = await buildInvoicePdf(data, node);
  triggerBlobDownload(result.blob, result.filename);
  return result;
}

export function downloadPdfBlob(blob: Blob, filename: string) {
  triggerBlobDownload(blob, filename);
}
