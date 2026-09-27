"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import {
  InvoiceData,
  InvoiceItem,
  bumpInvoiceCounter,
  calcTotal,
  emptyItem,
  formatDateUk,
  formatUah,
  loadSellerProfile,
  nextInvoiceNumber,
  paymentText,
  saveSellerProfile,
  todayIso,
  validateInvoice,
} from "@/lib/invoice";
import { downloadInvoicePdf } from "@/lib/pdf";

export default function InvoiceClient() {
  const previewRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [okMsg, setOkMsg] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [hydrated, setHydrated] = useState(false);

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
    fopGroup: "",
  });

  useEffect(() => {
    const profile = loadSellerProfile();
    setData((prev) => ({
      ...prev,
      number: nextInvoiceNumber(),
      ...(profile || {}),
    }));
    setHydrated(true);
  }, []);

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

  function removeItem(index: number) {
    setData((prev) => ({
      ...prev,
      items: prev.items.length <= 1 ? [emptyItem()] : prev.items.filter((_, i) => i !== index),
    }));
  }

  function persistProfile() {
    saveSellerProfile({
      sellerName: data.sellerName,
      sellerTaxId: data.sellerTaxId,
      sellerAddress: data.sellerAddress,
      sellerIban: data.sellerIban,
      sellerBank: data.sellerBank,
      fopGroup: data.fopGroup,
    });
    setProfileSaved(true);
    window.setTimeout(() => setProfileSaved(false), 2000);
  }

  async function copyPayment() {
    try {
      await navigator.clipboard.writeText(paymentText(data));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Не вдалося скопіювати. Скопіюйте вручну з прев’ю.");
    }
  }

  function printPreview() {
    window.print();
  }

  async function unlockAndDownload(e: FormEvent) {
    e.preventDefault();
    setError("");
    setOkMsg("");

    const invalid = validateInvoice(data);
    if (invalid) {
      setError(invalid);
      return;
    }
    if (!email.trim()) {
      setError("Вкажіть email для PDF і нагадувань.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          source: "invoice_pdf",
          fopGroup: data.fopGroup || undefined,
        }),
      });
      if (!res.ok) {
        setError("Перевірте email і спробуйте ще раз.");
        return;
      }

      persistProfile();
      downloadInvoicePdf(data);
      bumpInvoiceCounter(data.number);
      setUnlocked(true);
      setOkMsg("PDF завантажено. Ми зберегли email для нагадувань про податки.");
    } catch {
      setError("Щось пішло не так. Спробуйте ще раз.");
    } finally {
      setBusy(false);
    }
  }

  function downloadAgain() {
    const invalid = validateInvoice(data);
    if (invalid) {
      setError(invalid);
      return;
    }
    downloadInvoicePdf(data);
    setOkMsg("PDF завантажено знову.");
  }

  const field =
    "w-full rounded-xl border border-line bg-ink-2 px-3 py-2.5 text-sm text-paper outline-none transition placeholder:text-muted focus:border-signal";

  return (
    <main className="min-h-screen bg-ink print:bg-white">
      <div className="grid-atmosphere min-h-screen print:bg-white print:[background-image:none]">
        <div className="print:hidden">
          <SiteHeader />
        </div>

        <div className="mx-auto grid max-w-content gap-10 px-5 py-10 md:grid-cols-2 md:px-10 print:block print:max-w-none print:px-0 print:py-0">
          <section className="print:hidden">
            <h1 className="font-display text-3xl font-semibold text-paper md:text-4xl">Рахунок-фактура</h1>
            <p className="mt-3 text-mist">
              Заповніть → збережіть реквізити ФОП → email → PDF. Наступного разу поля підтягнуться самі.
            </p>

            <div className="mt-8 space-y-6">
              <div className="grid gap-3 sm:grid-cols-3">
                <label className="block text-sm">
                  <span className="mb-1.5 block text-muted">Номер</span>
                  <input className={field} value={data.number} onChange={(e) => update("number", e.target.value)} />
                </label>
                <label className="block text-sm">
                  <span className="mb-1.5 block text-muted">Дата</span>
                  <input
                    className={field}
                    type="date"
                    value={data.date}
                    onChange={(e) => update("date", e.target.value)}
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1.5 block text-muted">Група ФОП</span>
                  <select
                    className={field}
                    value={data.fopGroup}
                    onChange={(e) => update("fopGroup", e.target.value as InvoiceData["fopGroup"])}
                  >
                    <option value="">Не вказано</option>
                    <option value="2">2 група</option>
                    <option value="3">3 група</option>
                  </select>
                </label>
              </div>

              <div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="font-display text-lg text-signal">Виконавець (ФОП)</h2>
                  <button
                    type="button"
                    onClick={persistProfile}
                    className="text-sm text-mist underline-offset-2 hover:text-signal hover:underline"
                  >
                    {profileSaved ? "Збережено ✓" : "Зберегти реквізити"}
                  </button>
                </div>
                <div className="mt-3 space-y-3">
                  <input
                    className={field}
                    placeholder="ПІБ ФОП"
                    value={data.sellerName}
                    onChange={(e) => update("sellerName", e.target.value)}
                  />
                  <input
                    className={field}
                    placeholder="ІПН / ЄДРПОУ"
                    value={data.sellerTaxId}
                    onChange={(e) => update("sellerTaxId", e.target.value)}
                  />
                  <input
                    className={field}
                    placeholder="Адреса"
                    value={data.sellerAddress}
                    onChange={(e) => update("sellerAddress", e.target.value)}
                  />
                  <input
                    className={field}
                    placeholder="IBAN UA…"
                    value={data.sellerIban}
                    onChange={(e) => update("sellerIban", e.target.value)}
                  />
                  <input
                    className={field}
                    placeholder="Банк"
                    value={data.sellerBank}
                    onChange={(e) => update("sellerBank", e.target.value)}
                  />
                </div>
                {hydrated && data.sellerName ? (
                  <p className="mt-2 text-xs text-muted">Реквізити можна зберегти в браузері для наступних рахунків.</p>
                ) : null}
              </div>

              <div>
                <h2 className="font-display text-lg text-signal">Замовник</h2>
                <div className="mt-3 space-y-3">
                  <input
                    className={field}
                    placeholder="Назва / ПІБ"
                    value={data.buyerName}
                    onChange={(e) => update("buyerName", e.target.value)}
                  />
                  <input
                    className={field}
                    placeholder="ІПН / ЄДРПОУ"
                    value={data.buyerTaxId}
                    onChange={(e) => update("buyerTaxId", e.target.value)}
                  />
                  <input
                    className={field}
                    placeholder="Адреса"
                    value={data.buyerAddress}
                    onChange={(e) => update("buyerAddress", e.target.value)}
                  />
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
                <div className="mt-2 hidden grid-cols-[1fr_72px_100px_36px] gap-2 text-xs text-muted sm:grid">
                  <span>Опис</span>
                  <span>К-сть</span>
                  <span>Ціна</span>
                  <span />
                </div>
                <div className="mt-2 space-y-3">
                  {data.items.map((item, index) => (
                    <div key={index} className="grid gap-2 sm:grid-cols-[1fr_72px_100px_36px]">
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
                        aria-label="Кількість"
                        value={item.qty}
                        onChange={(e) => updateItem(index, { qty: Number(e.target.value) })}
                      />
                      <input
                        className={field}
                        type="number"
                        min={0}
                        step={0.01}
                        aria-label="Ціна"
                        value={item.price}
                        onChange={(e) => updateItem(index, { price: Number(e.target.value) })}
                      />
                      <button
                        type="button"
                        aria-label="Видалити рядок"
                        onClick={() => removeItem(index)}
                        className="rounded-xl border border-line text-mist transition hover:border-signal hover:text-signal"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <p className="mt-3 font-display text-xl text-paper">Разом: {formatUah(total)}</p>
              </div>

              <label className="block text-sm">
                <span className="mb-1.5 block text-muted">Примітка</span>
                <textarea
                  className={`${field} min-h-20`}
                  value={data.note}
                  onChange={(e) => update("note", e.target.value)}
                />
              </label>

              <form onSubmit={unlockAndDownload} className="border-t border-line pt-5">
                <p className="text-sm text-mist">
                  Email потрібен для PDF і календаря податкових нагадувань. Зберігаємо його як lead.
                </p>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                  <input
                    required
                    type="email"
                    className={field}
                    placeholder="you@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                  {unlocked ? (
                    <button
                      type="button"
                      onClick={downloadAgain}
                      className="rounded-xl bg-signal px-5 py-2.5 font-semibold text-ink transition hover:bg-white"
                    >
                      Завантажити знову
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={busy}
                      className="rounded-xl bg-signal px-5 py-2.5 font-semibold text-ink transition hover:bg-white disabled:opacity-60"
                    >
                      {busy ? "…" : "Отримати PDF"}
                    </button>
                  )}
                </div>

                {unlocked ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={copyPayment}
                      className="rounded-full border border-line px-4 py-2 text-sm text-mist transition hover:border-signal hover:text-signal"
                    >
                      {copied ? "Скопійовано ✓" : "Копіювати реквізити"}
                    </button>
                    <button
                      type="button"
                      onClick={printPreview}
                      className="rounded-full border border-line px-4 py-2 text-sm text-mist transition hover:border-signal hover:text-signal"
                    >
                      Друк
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setData((prev) => ({
                          ...prev,
                          number: nextInvoiceNumber(),
                          date: todayIso(),
                          buyerName: "",
                          buyerTaxId: "",
                          buyerAddress: "",
                          items: [emptyItem()],
                        }));
                        setUnlocked(false);
                        setOkMsg("Новий рахунок — реквізити ФОП залишились.");
                      }}
                      className="rounded-full border border-line px-4 py-2 text-sm text-mist transition hover:border-signal hover:text-signal"
                    >
                      Новий рахунок
                    </button>
                  </div>
                ) : null}

                {error ? <p className="mt-2 text-sm text-red-300">{error}</p> : null}
                {okMsg ? <p className="mt-2 text-sm text-signal">{okMsg}</p> : null}
              </form>
            </div>
          </section>

          <section className="md:sticky md:top-6 md:self-start print:static">
            <p className="mb-3 text-sm text-muted print:hidden">Попередній перегляд</p>
            <div
              ref={previewRef}
              className="rounded-sm bg-white p-8 text-[#111] shadow-[0_20px_60px_rgba(0,0,0,0.35)] print:shadow-none"
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
                  <p className="mt-1">{formatDateUk(data.date)}</p>
                </div>
              </div>

              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Виконавець</p>
                  <p className="mt-2 font-semibold">{data.sellerName || "—"}</p>
                  {data.fopGroup ? <p className="text-sm text-neutral-600">ФОП {data.fopGroup} група</p> : null}
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
