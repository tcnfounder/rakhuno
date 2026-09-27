import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { InvoiceData } from "./invoice";

export async function downloadInvoicePdf(data: InvoiceData, node: HTMLElement) {
  const canvas = await html2canvas(node, {
    scale: 2,
    backgroundColor: "#ffffff",
    useCORS: true,
    logging: false,
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
}
