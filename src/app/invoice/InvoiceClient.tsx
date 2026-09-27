"use client";

import { FormEvent, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import {
  InvoiceData,
  InvoiceItem,
  bumpInvoiceCounter,
  calcLine,
  calcTotal,
  emptyItem,
  formatDateUk,
  formatIban,
  formatTaxId,
  formatUah,
  loadSellerProfile,
  nextInvoiceNumber,
  parseAmount,
  paymentText,
  saveSellerProfile,
  todayIso,
  validateInvoice,
} from "@/lib/invoice";
import { downloadInvoicePdf } from "@/lib/pdf";

function SoftField({
  label,
  hint,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 flex items-baseline justify-between gap-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
        <span>{label}</span>
        {hint ? <span className="normal-case tracking-normal text-neutral-400">{hint}</span> : null}
      </span>
      {children}
    </label>
  );
}

const paperInput =
  "w-full border-0 border-b border-neutral-200 bg-transparent px-0 py-2 text-[15px] text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-900";

export default function InvoiceClient() {
  const previewRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [okMsg, setOkMsg] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [copied, setCopied] = useState(false);

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
  }, []);

  const total = useMemo(() => calcTotal(data.items), [data.items]);

  function update<K extends keyof InvoiceData>(key: K, value: InvoiceData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function updateItem(id: string, patch: Partial<InvoiceItem>) {
    setData((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    }));
  }

  function removeItem(id: string) {
    setData((prev) => ({
      ...prev,
      items: prev.items.length <= 1 ? [emptyItem()] : prev.items.filter((item) => item.id !== id),
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
  }

  async function makePdf() {
    const node = previewRef.current;
    if (!node) throw new Error("preview_missing");
    await downloadInvoicePdf(data, node);
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
      await makePdf();
      bumpInvoiceCounter(data.number);
      setUnlocked(true);
      setOkMsg("PDF готовий. Email збережено для нагадувань.");
    } catch {
      setError("Щось пішло не так.");
    } finally {
      setBusy(false);
    }
  }

  async function downloadAgain() {
    const invalid = validateInvoice(data);
    if (invalid) {
      setError(invalid);
      return;
    }
    setBusy(true);
    try {
      await makePdf();
      setOkMsg("PDF завантажено знову.");
    } catch {
      setError("Не вдалося створити PDF.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-ink print:bg-white">
      <div className="grid-atmosphere min-h-screen pb-28 print:bg-white print:pb-0 print:[background-image:none]">
        <div className="print:hidden">
          <SiteHeader />
        </div>

        <div className="mx-auto w-full max-w-content px-5 py-8 md:px-10 md:py-10">
          <div className="print:hidden mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-display text-3xl font-semibold text-paper md:text-4xl">Рахунок</h1>
              <p className="mt-2 max-w-xl text-mist">
                Заповнюєте документ нижче — PDF виглядає так само. Реквізити ФОП зберігаються в браузері.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                className="rounded-lg border border-white/15 bg-ink-2 px-3 py-2 text-sm text-paper"
                value={data.fopGroup}
                onChange={(e) => update("fopGroup", e.target.value as InvoiceData["fopGroup"])}
                aria-label="Група ФОП"
              >
                <option value="">Група ФОП</option>
                <option value="2">2 група</option>
                <option value="3">3 група</option>
              </select>
              <button
                type="button"
                onClick={persistProfile}
                className="rounded-lg border border-white/15 px-3 py-2 text-sm text-mist transition hover:border-signal hover:text-signal"
              >
                Зберегти ФОП
              </button>
            </div>
          </div>

          {/* Editable document — this IS the invoice */}
          <form onSubmit={unlockAndDownload}>
            <div
              ref={previewRef}
              className="mx-auto max-w-3xl rounded-sm bg-[#fbfaf7] p-6 text-[#171717] shadow-[0_24px_80px_rgba(0,0,0,0.45)] sm:p-10"
              style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
            >
              <div className="flex flex-col gap-6 border-b border-neutral-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                    Рахунок-фактура
                  </p>
                  <SoftField label="Постачальник (ФОП)" className="mt-3">
                    <input
                      className={`${paperInput} text-xl font-bold`}
                      placeholder="ПІБ ФОП"
                      value={data.sellerName}
                      onChange={(e) => update("sellerName", e.target.value)}
                    />
                  </SoftField>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <SoftField label="ІПН / ЄДРПОУ">
                      <input
                        className={paperInput}
                        inputMode="numeric"
                        placeholder="1234567890"
                        value={data.sellerTaxId}
                        onChange={(e) => update("sellerTaxId", formatTaxId(e.target.value))}
                      />
                    </SoftField>
                    <SoftField label="Банк">
                      <input
                        className={paperInput}
                        placeholder="ПриватБанк"
                        value={data.sellerBank}
                        onChange={(e) => update("sellerBank", e.target.value)}
                      />
                    </SoftField>
                  </div>
                  <SoftField label="IBAN" hint="обовʼязково" className="mt-3">
                    <input
                      className={`${paperInput} font-mono tracking-wide`}
                      placeholder="UA00 0000 …"
                      value={data.sellerIban}
                      onChange={(e) => update("sellerIban", formatIban(e.target.value))}
                    />
                  </SoftField>
                  <SoftField label="Адреса" className="mt-3">
                    <input
                      className={paperInput}
                      placeholder="м. Київ…"
                      value={data.sellerAddress}
                      onChange={(e) => update("sellerAddress", e.target.value)}
                    />
                  </SoftField>
                </div>
                <div className="w-full shrink-0 sm:w-40">
                  <SoftField label="Номер">
                    <input
                      className={paperInput}
                      value={data.number}
                      onChange={(e) => update("number", e.target.value.slice(0, 20))}
                    />
                  </SoftField>
                  <SoftField label="Дата" className="mt-3">
                    <input
                      className={paperInput}
                      type="date"
                      value={data.date}
                      onChange={(e) => update("date", e.target.value)}
                    />
                  </SoftField>
                  <p className="mt-3 text-right text-sm text-neutral-500 print:block">
                    від {formatDateUk(data.date)}
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                  Платник / замовник
                </p>
                <SoftField label="Назва / ПІБ" className="mt-3">
                  <input
                    className={`${paperInput} text-lg font-semibold`}
                    placeholder="ТОВ «Клієнт»"
                    value={data.buyerName}
                    onChange={(e) => update("buyerName", e.target.value)}
                  />
                </SoftField>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <SoftField label="ІПН / ЄДРПОУ" hint="опційно">
                    <input
                      className={paperInput}
                      inputMode="numeric"
                      value={data.buyerTaxId}
                      onChange={(e) => update("buyerTaxId", formatTaxId(e.target.value))}
                    />
                  </SoftField>
                  <SoftField label="Адреса" hint="опційно">
                    <input
                      className={paperInput}
                      value={data.buyerAddress}
                      onChange={(e) => update("buyerAddress", e.target.value)}
                    />
                  </SoftField>
                </div>
              </div>

              <div className="mt-10">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                    Позиції
                  </p>
                  <button
                    type="button"
                    onClick={() => update("items", [...data.items, emptyItem()])}
                    className="text-sm text-neutral-600 underline-offset-2 hover:text-neutral-900 hover:underline print:hidden"
                  >
                    + рядок
                  </button>
                </div>

                <div className="hidden grid-cols-[32px_1fr_72px_100px_110px_28px] gap-2 border-b border-neutral-200 pb-2 text-[11px] uppercase tracking-wide text-neutral-500 sm:grid">
                  <span>№</span>
                  <span>Опис</span>
                  <span>К-сть</span>
                  <span>Ціна</span>
                  <span className="text-right">Сума</span>
                  <span />
                </div>

                <div className="divide-y divide-neutral-100">
                  {data.items.map((item, index) => (
                    <div
                      key={item.id}
                      className="grid gap-2 py-3 sm:grid-cols-[32px_1fr_72px_100px_110px_28px] sm:items-center"
                    >
                      <span className="hidden text-sm text-neutral-400 sm:block">{index + 1}</span>
                      <input
                        className={paperInput}
                        placeholder="Опис послуги"
                        value={item.description}
                        onChange={(e) => updateItem(item.id, { description: e.target.value })}
                      />
                      <input
                        className={paperInput}
                        inputMode="decimal"
                        placeholder="1"
                        aria-label="Кількість"
                        value={item.qty}
                        onChange={(e) =>
                          updateItem(item.id, { qty: e.target.value.replace(/[^\d.,]/g, "").slice(0, 12) })
                        }
                      />
                      <input
                        className={paperInput}
                        inputMode="decimal"
                        placeholder="0"
                        aria-label="Ціна"
                        value={item.price}
                        onChange={(e) =>
                          updateItem(item.id, {
                            price: e.target.value.replace(/[^\d.,]/g, "").slice(0, 14),
                          })
                        }
                      />
                      <p className="text-right text-sm font-medium tabular-nums">
                        {formatUah(calcLine(item))}
                      </p>
                      <button
                        type="button"
                        aria-label="Видалити"
                        onClick={() => removeItem(item.id)}
                        className="justify-self-end text-neutral-400 hover:text-neutral-900 print:hidden"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex items-baseline justify-between border-t border-neutral-900 pt-4">
                  <span className="text-sm text-neutral-500">До сплати</span>
                  <span className="text-2xl font-bold tabular-nums">{formatUah(total)}</span>
                </div>
              </div>

              <SoftField label="Примітка" className="mt-8">
                <textarea
                  className={`${paperInput} min-h-[4rem] resize-y`}
                  value={data.note}
                  onChange={(e) => update("note", e.target.value)}
                />
              </SoftField>

              <p className="mt-10 text-[10px] text-neutral-400">
                Документ сформовано через rakhuno.com. Не є податковою консультацією.
              </p>
            </div>

            <div className="mx-auto mt-8 max-w-3xl print:hidden">
              <div className="rounded-xl border border-white/10 bg-ink-2/80 p-4 sm:p-5">
                <p className="text-sm text-mist">
                  Email потрібен для PDF і податкових нагадувань.
                </p>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                  <input
                    required
                    type="email"
                    autoComplete="email"
                    placeholder="you@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-white/15 bg-ink px-3.5 py-3 text-paper outline-none placeholder:text-muted focus:border-signal"
                  />
                  {unlocked ? (
                    <button
                      type="button"
                      onClick={downloadAgain}
                      disabled={busy}
                      className="rounded-lg bg-signal px-5 py-3 font-semibold text-ink transition hover:bg-white disabled:opacity-60"
                    >
                      {busy ? "…" : "PDF знову"}
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={busy}
                      className="rounded-lg bg-signal px-5 py-3 font-semibold text-ink transition hover:bg-white disabled:opacity-60"
                    >
                      {busy ? "…" : "Отримати PDF"}
                    </button>
                  )}
                </div>
                {unlocked ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(paymentText(data));
                          setCopied(true);
                          window.setTimeout(() => setCopied(false), 2000);
                        } catch {
                          setError("Не вдалося скопіювати.");
                        }
                      }}
                      className="rounded-full border border-white/15 px-3 py-1.5 text-sm text-mist hover:border-signal hover:text-signal"
                    >
                      {copied ? "Скопійовано ✓" : "Копіювати реквізити"}
                    </button>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="rounded-full border border-white/15 px-3 py-1.5 text-sm text-mist hover:border-signal hover:text-signal"
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
                        setOkMsg("Новий рахунок.");
                      }}
                      className="rounded-full border border-white/15 px-3 py-1.5 text-sm text-mist hover:border-signal hover:text-signal"
                    >
                      Новий рахунок
                    </button>
                  </div>
                ) : null}
                {error ? <p className="mt-2 text-sm text-red-300">{error}</p> : null}
                {okMsg ? <p className="mt-2 text-sm text-signal">{okMsg}</p> : null}
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-ink/95 p-3 backdrop-blur sm:hidden print:hidden">
        <button
          type="button"
          disabled={busy}
          onClick={() => document.querySelector("form")?.requestSubmit()}
          className="w-full rounded-lg bg-signal py-3.5 font-semibold text-ink disabled:opacity-60"
        >
          {busy ? "…" : unlocked ? `PDF знову · ${formatUah(total)}` : `Отримати PDF · ${formatUah(total)}`}
        </button>
      </div>
    </main>
  );
}
