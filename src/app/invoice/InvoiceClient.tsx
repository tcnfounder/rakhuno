"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { SiteHeader } from "@/components/SiteHeader";
import { InvoiceData, InvoiceItem, calcTotal, formatUah } from "@/lib/invoice";

const emptyItem = (): InvoiceItem => ({ description: "", qty: 1, price: 0 });

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function InvoiceClient() {
  const previewRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  const [data, setData] = useState<InvoiceData>({
    number: "1",
    date: todayIso(),
    sellerName: "",
    sellerTaxId: "",
    sellerAddress: "",
    sellerIban: "",
    sellerBank: "",
    buyerName: "",
    buyerTaxId: "",
    buyerAddress: "",
    items: [emptyItem()],
    note: "Оплата протягом 5 банківських днів.",
  });

  const total = useMemo(() => calcTotal(data.items), [data.items]);

  function update<K extends keyof InvoiceData>(key: K, value: InvoiceData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function updateItem(index: number, patch: Partial<InvoiceItem>) {
    setData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    }));
  }

  async function unlockAndDownload(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "invoice_pdf" }),
      });
      if (!res.ok) {
        setError("Перевірте email і спробуйте ще раз.");
        return;
      }
      setUnlocked(true);
      await generatePdf();
    } catch {
      setError("Щось пішло не так. Спробуйте ще раз.");
    } finally {
      setBusy(false);
    }
  }

  async function generatePdf() {
    const node = previewRef.current;
    if (!node) return;
    const canvas = await html2canvas(node, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
    });
    const img = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
    const w = canvas.width * ratio;
    const h = canvas.height * ratio;
    pdf.addImage(img, "PNG", (pageWidth - w) / 2, 8, w, h);
    pdf.save(`rakhuno-rahunok-${data.number || "draft"}.pdf`);
  }

  const field =
    "w-full rounded-xl border border-line bg-ink-2 px-3 py-2.5 text-sm text-paper outline-none transition placeholder:text-muted focus:border-signal";

  return (
    <main className="min-h-screen bg-ink">
      <div className="grid-atmosphere min-h-screen">
        <SiteHeader />
        <div className="mx-auto grid max-w-content gap-10 px-5 py-10 md:grid-cols-2 md:px-10">
          <section>
            <h1 className="font-display text-3xl font-semibold text-paper md:text-4xl">Рахунок-фактура</h1>
            <p className="mt-3 text-mist">Заповніть поля → залиште email → завантажте PDF. Це безкоштовно.</p>

            <div className="mt-8 space-y-6">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="mb-1.5 block text-muted">Номер</span>
                  <input className={field} value={data.number} onChange={(e) => update("number", e.target.value)} />
                </label>
                <label className="block text-sm">
                  <span className="mb-1.5 block text-muted">Дата</span>
                  <input className={field} type="date" value={data.date} onChange={(e) => update("date", e.target.value)} />
                </label>
              </div>

              <div>
                <h2 className="font-display text-lg text-signal">Виконавець (ФОП)</h2>
                <div className="mt-3 space-y-3">
                  <input className={field} placeholder="ПІБ ФОП" value={data.sellerName} onChange={(e) => update("sellerName", e.target.value)} />
                  <input className={field} placeholder="ІПН / ЄДРПОУ" value={data.sellerTaxId} onChange={(e) => update("sellerTaxId", e.target.value)} />
                  <input className={field} placeholder="Адреса" value={data.sellerAddress} onChange={(e) => update("sellerAddress", e.target.value)} />
                  <input className={field} placeholder="IBAN" value={data.sellerIban} onChange={(e) => update("sellerIban", e.target.value)} />
                  <input className={field} placeholder="Банк" value={data.sellerBank} onChange={(e) => update("sellerBank", e.target.value)} />
                </div>
              </div>

              <div>
                <h2 className="font-display text-lg text-signal">Замовник</h2>
                <div className="mt-3 space-y-3">
                  <input className={field} placeholder="Назва / ПІБ" value={data.buyerName} onChange={(e) => update("buyerName", e.target.value)} />
                  <input className={field} placeholder="ІПН / ЄДРПОУ" value={data.buyerTaxId} onChange={(e) => update("buyerTaxId", e.target.value)} />
                  <input className={field} placeholder="Адреса" value={data.buyerAddress} onChange={(e) => update("buyerAddress", e.target.value)} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-display text-lg text-signal">Позиції</h2>
                  <button
                    type="button"
                    className="text-sm text-mist underline-offset-2 hover:text-signal hover:underline"
                    onClick={() => update("items", [...data.items, emptyItem()])}
                  >
                    + рядок
                  </button>
                </div>
                <div className="mt-3 space-y-3">
                  {data.items.map((item, index) => (
                    <div key={index} className="grid gap-2 sm:grid-cols-[1fr_72px_100px]">
                      <input
                        className={field}
                        placeholder="Опис послуги / товару"
                        value={item.description}
                        onChange={(e) => updateItem(index, { description: e.target.value })}
                      />
                      <input
                        className={field}
                        type="number"
                        min={0}
                        step={1}
                        value={item.qty}
                        onChange={(e) => updateItem(index, { qty: Number(e.target.value) })}
                      />
                      <input
                        className={field}
                        type="number"
                        min={0}
                        step={0.01}
                        value={item.price}
                        onChange={(e) => updateItem(index, { price: Number(e.target.value) })}
                      />
                    </div>
                  ))}
                </div>
                <p className="mt-3 font-display text-xl text-paper">Разом: {formatUah(total)}</p>
              </div>

              <label className="block text-sm">
                <span className="mb-1.5 block text-muted">Примітка</span>
                <textarea className={`${field} min-h-20`} value={data.note} onChange={(e) => update("note", e.target.value)} />
              </label>

              <form onSubmit={unlockAndDownload} className="rounded-2xl border border-line bg-ink-2/80 p-4">
                <p className="text-sm text-mist">
                  Email потрібен, щоб надіслати календар податкових нагадувань. PDF одразу після цього.
                </p>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                  <input
                    required
                    type="email"
                    className={field}
                    placeholder="you@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={busy}
                    className="rounded-xl bg-signal px-5 py-2.5 font-semibold text-ink transition hover:bg-white disabled:opacity-60"
                  >
                    {busy ? "…" : unlocked ? "Завантажити знову" : "Отримати PDF"}
                  </button>
                </div>
                {error ? <p className="mt-2 text-sm text-red-300">{error}</p> : null}
              </form>
            </div>
          </section>

          <section>
            <p className="mb-3 text-sm text-muted">Попередній перегляд</p>
            <div
              ref={previewRef}
              className="rounded-sm bg-white p-8 text-[#111] shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
              style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
            >
              <div className="flex items-start justify-between gap-4 border-b border-neutral-200 pb-4">
                <div>
                  <p className="text-2xl font-bold tracking-tight">Rakhuno</p>
                  <p className="mt-1 text-sm text-neutral-600">Рахунок-фактура</p>
                </div>
                <div className="text-right text-sm">
                  <p>
                    <span className="text-neutral-500">№ </span>
                    {data.number || "—"}
                  </p>
                  <p className="mt-1">{data.date || "—"}</p>
                </div>
              </div>

              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Виконавець</p>
                  <p className="mt-2 font-semibold">{data.sellerName || "—"}</p>
                  {data.sellerTaxId ? <p className="text-sm">ІПН/ЄДРПОУ: {data.sellerTaxId}</p> : null}
                  {data.sellerAddress ? <p className="text-sm">{data.sellerAddress}</p> : null}
                  {data.sellerIban ? <p className="text-sm">IBAN: {data.sellerIban}</p> : null}
                  {data.sellerBank ? <p className="text-sm">{data.sellerBank}</p> : null}
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Замовник</p>
                  <p className="mt-2 font-semibold">{data.buyerName || "—"}</p>
                  {data.buyerTaxId ? <p className="text-sm">ІПН/ЄДРПОУ: {data.buyerTaxId}</p> : null}
                  {data.buyerAddress ? <p className="text-sm">{data.buyerAddress}</p> : null}
                </div>
              </div>

              <table className="mt-8 w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 text-neutral-500">
                    <th className="py-2 font-medium">Опис</th>
                    <th className="py-2 font-medium">К-сть</th>
                    <th className="py-2 font-medium">Ціна</th>
                    <th className="py-2 font-medium">Сума</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item, index) => (
                    <tr key={index} className="border-b border-neutral-100">
                      <td className="py-2 pr-2">{item.description || "—"}</td>
                      <td className="py-2">{item.qty || 0}</td>
                      <td className="py-2">{formatUah(item.price || 0)}</td>
                      <td className="py-2">{formatUah((item.qty || 0) * (item.price || 0))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <p className="mt-6 text-right text-lg font-bold">Разом: {formatUah(total)}</p>
              {data.note ? <p className="mt-6 text-sm text-neutral-600">Примітка: {data.note}</p> : null}
              <p className="mt-10 text-[11px] text-neutral-400">
                Згенеровано в Rakhuno. Не є податковою консультацією.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
