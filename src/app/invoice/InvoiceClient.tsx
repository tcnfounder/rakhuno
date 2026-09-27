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
  paymentText,
  saveSellerProfile,
  todayIso,
  validateInvoice,
} from "@/lib/invoice";
import { cropLogoToSquare } from "@/lib/logo";
import { downloadInvoicePdf, downloadPdfBlob, type PdfResult } from "@/lib/pdf";

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
  "w-full appearance-none border-0 border-b border-neutral-200 bg-transparent px-0 py-2 text-[14px] leading-[1.45] text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-900 min-h-[2.25rem] overflow-visible";

export default function InvoiceClient() {
  const previewRef = useRef<HTMLDivElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [okMsg, setOkMsg] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [lastPdf, setLastPdf] = useState<PdfResult | null>(null);
  const [showDone, setShowDone] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [data, setData] = useState<InvoiceData>({
    number: "1",
    date: todayIso(),
    sellerLogo: "",
    sellerName: "",
    sellerTaxId: "",
    sellerAddress: "",
    sellerIban: "",
    sellerBank: "",
    buyerName: "",
    buyerTaxId: "",
    buyerAddress: "",
    items: [emptyItem("line-initial")],
    note: "Оплата протягом 5 банківських днів.",
    fopGroup: "",
  });

  useEffect(() => {
    const profile = loadSellerProfile();
    setData((prev) => ({
      ...prev,
      number: nextInvoiceNumber(),
      date: todayIso(),
      ...(profile || {}),
      sellerLogo: profile?.sellerLogo || prev.sellerLogo || "",
    }));
    setMounted(true);
  }, []);

  const total = useMemo(() => calcTotal(data.items), [data.items]);

  if (!mounted) {
    return (
      <main className="min-h-screen bg-ink">
        <div className="grid-atmosphere min-h-screen">
          <SiteHeader />
          <div className="mx-auto max-w-content px-5 py-16 text-mist">Завантаження рахунку…</div>
        </div>
      </main>
    );
  }

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
      sellerLogo: data.sellerLogo,
      sellerName: data.sellerName,
      sellerTaxId: data.sellerTaxId,
      sellerAddress: data.sellerAddress,
      sellerIban: data.sellerIban,
      sellerBank: data.sellerBank,
      fopGroup: data.fopGroup,
    });
  }

  async function onLogoPicked(file: File | null) {
    if (!file) return;
    setError("");
    try {
      const dataUrl = await cropLogoToSquare(file);
      update("sellerLogo", dataUrl);
      setOkMsg("Логотип додано (квадратний crop).");
    } catch {
      setError("Не вдалося обробити зображення. Спробуйте JPG/PNG до 8 МБ.");
    }
  }

  async function makePdf(): Promise<PdfResult> {
    const node = previewRef.current;
    if (!node) throw new Error("preview_missing");
    const result = await downloadInvoicePdf(data, node);
    setLastPdf(result);
    return result;
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
      // PDF first so download isn't blocked by network; lead in parallel.
      const leadPromise = fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          source: "invoice_pdf",
          fopGroup: data.fopGroup || undefined,
        }),
      }).catch(() => null);

      persistProfile();
      await makePdf();
      bumpInvoiceCounter(data.number);
      setUnlocked(true);
      setShowDone(true);
      setOkMsg("PDF готовий — перевірте завантаження.");

      const res = await leadPromise;
      if (res && !res.ok) {
        setOkMsg("PDF готовий. Email не збережено — спробуйте ще раз пізніше.");
      }
    } catch {
      setError("Не вдалося створити PDF. Натисніть «Завантажити знову».");
      setUnlocked(true);
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
    setError("");
    try {
      if (lastPdf) {
        downloadPdfBlob(lastPdf.blob, lastPdf.filename);
        setOkMsg("PDF завантажено знову.");
        setShowDone(true);
      } else {
        await makePdf();
        setOkMsg("PDF завантажено знову.");
        setShowDone(true);
      }
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
                Документ у форматі A4. PDF виглядає так само. Логотип ФОП — опційно, безкоштовно.
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

          <form onSubmit={unlockAndDownload}>
            <div className="mx-auto w-full max-w-[210mm] overflow-x-auto">
              <div
                ref={previewRef}
                className="mx-auto w-[210mm] min-h-[297mm] bg-white text-[#171717] shadow-[0_24px_80px_rgba(0,0,0,0.45)] print:shadow-none"
                style={{
                  fontFamily: "Arial, Helvetica, sans-serif",
                  padding: "16mm 16mm 14mm",
                  boxSizing: "border-box",
                }}
              >
                {/* Header: logo + title + meta */}
                <div className="flex items-start justify-between gap-6 border-b border-neutral-900 pb-5">
                  <div className="flex min-w-0 flex-1 items-start gap-4">
                    <div className="shrink-0" data-pdf-hide={data.sellerLogo ? undefined : true}>
                      {data.sellerLogo ? (
                        <div className="relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={data.sellerLogo}
                            alt=""
                            width={64}
                            height={64}
                            className="h-16 w-16 rounded-md object-cover ring-1 ring-neutral-200"
                          />
                          <button
                            type="button"
                            data-pdf-hide
                            onClick={() => update("sellerLogo", "")}
                            className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900 text-[10px] text-white"
                            aria-label="Прибрати логотип"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          data-pdf-hide
                          onClick={() => logoInputRef.current?.click()}
                          className="flex h-16 w-16 flex-col items-center justify-center rounded-md border border-dashed border-neutral-300 bg-neutral-50 text-center text-[10px] leading-tight text-neutral-500 hover:border-neutral-500 hover:text-neutral-800"
                        >
                          +
                          <span>лого</span>
                        </button>
                      )}
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        data-pdf-hide
                        onChange={(e) => {
                          void onLogoPicked(e.target.files?.[0] || null);
                          e.target.value = "";
                        }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
                        Рахунок-фактура
                      </p>
                      <SoftField label="Постачальник (ФОП)" className="mt-2">
                        <input
                          className={`${paperInput} text-xl font-bold`}
                          placeholder="ПІБ ФОП"
                          value={data.sellerName}
                          onChange={(e) => update("sellerName", e.target.value)}
                        />
                      </SoftField>
                    </div>
                  </div>
                  <div className="w-[120px] shrink-0 text-right">
                    <SoftField label="Номер">
                      <input
                        className={`${paperInput} text-right`}
                        value={data.number}
                        onChange={(e) => update("number", e.target.value.slice(0, 20))}
                      />
                    </SoftField>
                    <SoftField label="Дата" className="mt-2">
                      <input
                        className={`${paperInput} text-right`}
                        type="date"
                        value={data.date}
                        onChange={(e) => update("date", e.target.value)}
                      />
                    </SoftField>
                    <p className="mt-2 text-xs text-neutral-500">від {formatDateUk(data.date)}</p>
                  </div>
                </div>

                {!data.sellerLogo ? (
                  <p className="mt-2 text-[11px] text-neutral-400 print:hidden" data-pdf-hide>
                    Логотип необовʼязковий — квадратний crop зберігається в браузері.
                  </p>
                ) : null}

                <div className="mt-5 grid gap-x-8 gap-y-2 sm:grid-cols-2">
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
                  <SoftField label="IBAN" hint="обовʼязково" className="sm:col-span-2">
                    <input
                      className={`${paperInput} font-mono tracking-wide`}
                      placeholder="UA00 0000 …"
                      value={data.sellerIban}
                      onChange={(e) => update("sellerIban", formatIban(e.target.value))}
                    />
                  </SoftField>
                  <SoftField label="Адреса" className="sm:col-span-2">
                    <input
                      className={paperInput}
                      placeholder="м. Київ…"
                      value={data.sellerAddress}
                      onChange={(e) => update("sellerAddress", e.target.value)}
                    />
                  </SoftField>
                </div>

                <div className="mt-8 rounded-sm bg-neutral-50 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                    Платник / замовник
                  </p>
                  <SoftField label="Назва / ПІБ" className="mt-2">
                    <input
                      className={`${paperInput} text-lg font-semibold`}
                      placeholder="ТОВ «Клієнт»"
                      value={data.buyerName}
                      onChange={(e) => update("buyerName", e.target.value)}
                    />
                  </SoftField>
                  <div className="mt-2 grid gap-3 sm:grid-cols-2">
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

                <div className="mt-8">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                      Позиції
                    </p>
                    <button
                      type="button"
                      data-pdf-hide
                      onClick={() => update("items", [...data.items, emptyItem()])}
                      className="text-sm text-neutral-600 underline-offset-2 hover:text-neutral-900 hover:underline"
                    >
                      + рядок
                    </button>
                  </div>

                  <div className="overflow-hidden rounded-sm border border-neutral-200">
                    <div className="grid grid-cols-[36px_1fr_64px_88px_96px_28px] gap-2 border-b border-neutral-200 bg-neutral-50 px-2 py-2 text-[10px] uppercase tracking-wide text-neutral-500">
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
                          className="grid grid-cols-[36px_1fr_64px_88px_96px_28px] items-center gap-2 px-2 py-2"
                        >
                          <span className="text-sm text-neutral-400">{index + 1}</span>
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
                              updateItem(item.id, {
                                qty: e.target.value.replace(/[^\d.,]/g, "").slice(0, 12),
                              })
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
                            data-pdf-hide
                            aria-label="Видалити"
                            onClick={() => removeItem(item.id)}
                            className="justify-self-end text-neutral-400 hover:text-neutral-900"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 flex items-baseline justify-between border-t-2 border-neutral-900 pt-3">
                    <span className="text-sm font-medium uppercase tracking-wide text-neutral-500">
                      До сплати
                    </span>
                    <span className="text-2xl font-bold tabular-nums">{formatUah(total)}</span>
                  </div>
                </div>

                <SoftField label="Примітка" className="mt-6">
                  <textarea
                    className={`${paperInput} min-h-[3.5rem] resize-y`}
                    value={data.note}
                    onChange={(e) => update("note", e.target.value)}
                  />
                </SoftField>

                <p className="mt-8 text-[9px] text-neutral-400">
                  Документ сформовано через rakhuno.com. Не є податковою консультацією.
                </p>
              </div>
            </div>

            <div className="mx-auto mt-8 max-w-[210mm] print:hidden">
              <div className="rounded-xl border border-white/10 bg-ink-2/80 p-4 sm:p-5">
                <p className="text-sm text-mist">
                  Email потрібен, щоб зберегти PDF-сценарій і надіслати податкові нагадування. PDF
                  завантажується у браузер — ми не надсилаємо рахунок вашому клієнту.
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
                      {busy ? "…" : "Завантажити знову"}
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
                        setLastPdf(null);
                        setShowDone(false);
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
          onClick={() => {
            if (unlocked) {
              void downloadAgain();
            } else {
              document.querySelector("form")?.requestSubmit();
            }
          }}
          className="w-full rounded-lg bg-signal py-3.5 font-semibold text-ink disabled:opacity-60"
        >
          {busy
            ? "…"
            : unlocked
              ? `Завантажити знову · ${formatUah(total)}`
              : `Отримати PDF · ${formatUah(total)}`}
        </button>
      </div>

      {showDone ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center print:hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pdf-done-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-ink-2 p-5 shadow-2xl">
            <h2 id="pdf-done-title" className="font-display text-xl font-semibold text-paper">
              PDF готовий
            </h2>
            <p className="mt-2 text-sm text-mist">
              Файл має зʼявитися в завантаженнях. Якщо ні — натисніть кнопку нижче (Safari інколи
              блокує автозавантаження).
            </p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => void downloadAgain()}
                disabled={busy}
                className="flex-1 rounded-lg bg-signal px-4 py-3 font-semibold text-ink hover:bg-white disabled:opacity-60"
              >
                Завантажити PDF
              </button>
              <button
                type="button"
                onClick={() => setShowDone(false)}
                className="rounded-lg border border-white/15 px-4 py-3 text-mist hover:border-signal hover:text-signal"
              >
                Закрити
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
