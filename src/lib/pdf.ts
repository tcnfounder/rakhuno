import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { InvoiceData, formatDateUk } from "./invoice";

/** html2canvas clips <input>/<textarea> text — flatten to plain nodes first. */
function flattenFormControls(root: HTMLElement) {
  const controls = root.querySelectorAll("input, textarea, select");
  controls.forEach((el) => {
    const control = el as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    const replacement = document.createElement(control.tagName === "TEXTAREA" ? "div" : "div");
    let text = control.value || "";

    if (control instanceof HTMLInputElement && control.type === "date" && text) {
      text = formatDateUk(text);
    }
    if (control instanceof HTMLSelectElement) {
      text = control.options[control.selectedIndex]?.text || text;
    }

    replacement.textContent = text || "—";
    replacement.setAttribute(
      "style",
      [
        "display:block",
        "width:100%",
        "margin:0",
        "padding:8px 0 6px",
        "border:0",
        "border-bottom:1px solid #e5e5e5",
        "background:transparent",
        "color:#171717",
        "font:inherit",
        "font-size:inherit",
        "font-weight:inherit",
        "line-height:1.45",
        "letter-spacing:inherit",
        "white-space:pre-wrap",
        "word-break:break-word",
        "min-height:1.6em",
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
      replacement.style.fontSize = "18px";
      replacement.style.fontWeight = "600";
    }

    control.replaceWith(replacement);
  });

  root.querySelectorAll("button, .print\\:hidden").forEach((el) => {
    (el as HTMLElement).style.display = "none";
  });
}

export async function downloadInvoicePdf(data: InvoiceData, node: HTMLElement) {
  const clone = node.cloneNode(true) as HTMLElement;
  clone.style.position = "fixed";
  clone.style.left = "-10000px";
  clone.style.top = "0";
  clone.style.width = `${Math.max(node.offsetWidth, 720)}px`;
  clone.style.zIndex = "-1";
  clone.style.pointerEvents = "none";
  document.body.appendChild(clone);

  flattenFormControls(clone);

  try {
    const canvas = await html2canvas(clone, {
      scale: 2,
      backgroundColor: "#fbfaf7",
      useCORS: true,
      logging: false,
      windowWidth: clone.scrollWidth,
      windowHeight: clone.scrollHeight,
    });

    const img = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ unit: "mm", format: "a4" });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const maxW = pageW - margin * 2;
    const maxH = pageH - margin * 2;
    const ratio = Math.min(maxW / canvas.width, maxH / canvas.height);
    const w = canvas.width * ratio;
    const h = canvas.height * ratio;
    pdf.addImage(img, "PNG", (pageW - w) / 2, margin, w, h);

    const safeNum = (data.number || "draft").replace(/[^\w\-]+/g, "_");
    pdf.save(`rahunok-${safeNum}.pdf`);
  } finally {
    clone.remove();
  }
}
