import { jsPDF } from "jspdf";
import { InvoiceData, calcTotal, formatDateUk, formatUah } from "./invoice";

function money(n: number) {
  return formatUah(n).replace(/\u00a0/g, " ");
}

export function buildInvoicePdf(data: InvoiceData) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 16;
  let y = 18;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Rakhuno", margin, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(90);
  doc.text("Рахунок-фактура", margin, y + 6);

  doc.setTextColor(20);
  doc.setFontSize(11);
  doc.text(`№ ${data.number || "—"}`, pageW - margin, y, { align: "right" });
  doc.setFontSize(10);
  doc.setTextColor(90);
  doc.text(formatDateUk(data.date), pageW - margin, y + 6, { align: "right" });
  doc.setTextColor(20);

  y += 16;
  doc.setDrawColor(220);
  doc.line(margin, y, pageW - margin, y);
  y += 10;

  const col = (pageW - margin * 2 - 8) / 2;
  const leftX = margin;
  const rightX = margin + col + 8;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(110);
  doc.text("ВИКОНАВЕЦЬ", leftX, y);
  doc.text("ЗАМОВНИК", rightX, y);
  doc.setTextColor(20);
  y += 6;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  const sellerLines = doc.splitTextToSize(data.sellerName || "—", col);
  const buyerLines = doc.splitTextToSize(data.buyerName || "—", col);
  doc.text(sellerLines, leftX, y);
  doc.text(buyerLines, rightX, y);

  let sellerY = y + sellerLines.length * 5 + 2;
  let buyerY = y + buyerLines.length * 5 + 2;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  const sellerMeta = [
    data.sellerTaxId ? `ІПН/ЄДРПОУ: ${data.sellerTaxId}` : null,
    data.sellerAddress || null,
    data.sellerIban ? `IBAN: ${data.sellerIban}` : null,
    data.sellerBank ? `Банк: ${data.sellerBank}` : null,
  ].filter(Boolean) as string[];

  const buyerMeta = [
    data.buyerTaxId ? `ІПН/ЄДРПОУ: ${data.buyerTaxId}` : null,
    data.buyerAddress || null,
  ].filter(Boolean) as string[];

  for (const line of sellerMeta) {
    const parts = doc.splitTextToSize(line, col);
    doc.text(parts, leftX, sellerY);
    sellerY += parts.length * 4.2;
  }
  for (const line of buyerMeta) {
    const parts = doc.splitTextToSize(line, col);
    doc.text(parts, rightX, buyerY);
    buyerY += parts.length * 4.2;
  }

  y = Math.max(sellerY, buyerY) + 8;

  const rows = data.items.filter((i) => i.description.trim());
  const cols = {
    desc: margin,
    qty: pageW - margin - 62,
    price: pageW - margin - 40,
    sum: pageW - margin,
  };

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(110);
  doc.text("Опис", cols.desc, y);
  doc.text("К-сть", cols.qty, y, { align: "right" });
  doc.text("Ціна", cols.price, y, { align: "right" });
  doc.text("Сума", cols.sum, y, { align: "right" });
  doc.setTextColor(20);
  y += 3;
  doc.setDrawColor(220);
  doc.line(margin, y, pageW - margin, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  for (const item of rows.length ? rows : [{ description: "—", qty: 0, price: 0 }]) {
    const descWidth = cols.qty - margin - 8;
    const desc = doc.splitTextToSize(item.description || "—", descWidth);
    const rowH = Math.max(desc.length * 4.5, 6);
    if (y + rowH > 270) {
      doc.addPage();
      y = 18;
    }
    doc.text(desc, cols.desc, y);
    doc.text(String(item.qty || 0), cols.qty, y, { align: "right" });
    doc.text(money(item.price || 0), cols.price, y, { align: "right" });
    doc.text(money((item.qty || 0) * (item.price || 0)), cols.sum, y, { align: "right" });
    y += rowH + 3;
  }

  y += 2;
  doc.setDrawColor(220);
  doc.line(margin, y, pageW - margin, y);
  y += 8;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(`Разом: ${money(calcTotal(data.items))}`, pageW - margin, y, { align: "right" });
  y += 10;

  if (data.note.trim()) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(80);
    const note = doc.splitTextToSize(`Примітка: ${data.note}`, pageW - margin * 2);
    doc.text(note, margin, y);
    y += note.length * 4.2 + 6;
  }

  doc.setFontSize(8);
  doc.setTextColor(140);
  doc.text("Згенеровано в Rakhuno. Не є податковою консультацією.", margin, 285);

  return doc;
}

export function downloadInvoicePdf(data: InvoiceData) {
  const doc = buildInvoicePdf(data);
  doc.save(`rakhuno-rahunok-${data.number || "draft"}.pdf`);
}
