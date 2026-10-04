"use client";

import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import {
  InvoiceData,
  InvoiceItem,
  amountInWordsUk,
  bumpInvoiceCounter,
  calcLine,
  calcTotal,
  emptyItem,
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
import { trackAdsConversion, trackEvent } from "@/lib/analytics";
import { prepareLogo } from "@/lib/logo";
import { downloadInvoicePdf, downloadPdfBlob, type PdfResult } from "@/lib/pdf";

const LAST_PDF_META_KEY = "rakhuno.lastPdfMeta.v1";

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
      <span className="mb-0.5 flex items-baseline justify-between gap-2 text-[10px] font-semibold uppercase tracking-[0.06em] text-neutral-500">
        <span>{label}</span>
        {hint ? <span className="normal-case tracking-normal text-neutral-400">{hint}</span> : null}
      </span>
      {children}
    </label>
  );
}

const lineInput =
  "w-full appearance-none border-0 border-b border-neutral-300 bg-transparent px-0 py-1 text-[13px] leading-[1.35] text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-900 min-h-[1.75rem]";

const cellInput =
  "w-full appearance-none border-0 bg-transparent px-1.5 py-1.5 text-[12px] leading-[1.3] text-neutral-900 outline-none placeholder:text-neutral-400 focus:bg-neutral-50 min-h-[2rem]";

/** Touch-friendly fields for the mobile editor (A4 sheet stays off-screen for PDF). */
const mobileInput =
  "w-full rounded-xl border border-white/15 bg-ink px-3.5 py-3 text-[16px] leading-snug text-paper outline-none placeholder:text-muted focus:border-signal";

function MobileField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-mist">
        <span>{label}</span>
        {hint ? <span className="normal-case tracking-normal text-muted">{hint}</span> : null}
      </span>
      {children}
    </label>
  );
}

export default function InvoiceClient() {
  const previewRef = useRef<HTMLDivElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const readyRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [okMsg, setOkMsg] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [lastPdf, setLastPdf] = useState<PdfResult | null>(null);
  const [pdfReady, setPdfReady] = useState(false);
  const [mounted, setMounted] = useState(false);
  /** Mobile wizard: 0 ФОП → 1 клієнт → 2 позиції → 3 PDF */
  const [mobileStep, setMobileStep] = useState(0);
  const [showSellerExtra, setShowSellerExtra] = useState(false);

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
    note: "Оплата протягом 5 банківських днів на зазначений IBAN. Без ПДВ.",
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
    try {
      const meta = window.sessionStorage.getItem(LAST_PDF_META_KEY);
      if (meta) {
        setUnlocked(true);
        setOkMsg("PDF уже створювався в цій сесії — натисніть «Завантажити PDF» нижче.");
      }
    } catch {
      /* ignore */
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!pdfReady) return;
    setMobileStep(3);
    readyRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [pdfReady]);

  const total = useMemo(() => calcTotal(data.items), [data.items]);
  const hasLogo = Boolean(data.sellerLogo);
  const words = useMemo(() => amountInWordsUk(total), [total]);

  const MOBILE_STEPS = ["ФОП", "Клієнт", "Позиції", "PDF"] as const;

  function validateMobileStep(step: number): string | null {
    if (step === 0) {
      if (!data.sellerName.trim()) return "Вкажіть ПІБ ФОП.";
      if (!data.sellerIban.trim() || data.sellerIban.replace(/\s/g, "").length < 15) {
        return "Вкажіть IBAN.";
      }
      return null;
    }
    if (step === 1) {
      if (!data.buyerName.trim()) return "Вкажіть замовника.";
      return null;
    }
    if (step === 2) {
      const lines = data.items.filter((i) => i.description.trim());
      if (!lines.length) return "Додайте позицію з описом.";
      for (const line of lines) {
        if (!(parseAmount(line.qty) > 0)) return "Кількість > 0.";
        if (line.price.trim() === "" || parseAmount(line.price) < 0) {
          return "Вкажіть ціну.";
        }
      }
      return null;
    }
    return null;
  }

  function goMobileNext() {
    setError("");
    const err = validateMobileStep(mobileStep);
    if (err) {
      setError(err);
      return;
    }
    if (mobileStep === 0) persistProfile();
    if (mobileStep < MOBILE_STEPS.length - 1) {
      setMobileStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function goMobileBack() {
    setError("");
    if (mobileStep > 0) {
      setMobileStep((s) => s - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  if (!mounted) {
    return (
      <main className="min-h-screen bg-ink">
        <div className="grid-atmosphere min-h-screen">
          <SiteHeader />
          <div className="mx-auto max-w-content px-5 py-16 text-mist">Завантаження…</div>
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
      items: prev.items.map((item) =>
        item.id === id ? { ...item, unit: item.unit || "послуга", ...patch } : item,
      ),
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
      const dataUrl = await prepareLogo(file);
      update("sellerLogo", dataUrl);
      setOkMsg("Логотип додано.");
    } catch {
      setError("Не вдалося обробити зображення. JPG/PNG до 8 МБ.");
    }
  }

  async function makePdf(): Promise<PdfResult> {
    const node = previewRef.current;
    if (!node) throw new Error("preview_missing");
    const result = await downloadInvoicePdf(data, node);
    setLastPdf(result);
    try {
      window.sessionStorage.setItem(
        LAST_PDF_META_KEY,
        JSON.stringify({ filename: result.filename, at: Date.now() }),
      );
    } catch {
      /* ignore */
    }
    return result;
  }

  async function unlockAndDownload() {
    setError("");
    setOkMsg("");
    const invalid = validateInvoice(data);
    if (invalid) {
      setError(invalid);
      return;
    }
    if (!email.trim()) {
      setError("Вкажіть email — для податкових нагадувань.");
      return;
    }
    setBusy(true);
    try {
      void fetch("/api/leads", {
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
      setPdfReady(true);
      setOkMsg("PDF сформовано. Якщо файл не зʼявився — кнопка нижче.");
      trackEvent("invoice_pdf_unlock", {
        fop_group: data.fopGroup || "none",
        item_count: data.items.length,
      });
      trackEvent("generate_lead", { method: "invoice_pdf" });
      trackAdsConversion();
    } catch {
      setError("Не вдалося створити PDF. Спробуйте ще раз кнопкою нижче.");
      setUnlocked(true);
      setPdfReady(true);
      trackEvent("invoice_pdf_error", { stage: "unlock" });
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
      } else {
        await makePdf();
      }
      setPdfReady(true);
      setOkMsg("PDF завантажено.");
      trackEvent("invoice_pdf_redownload", {
        from_cache: Boolean(lastPdf),
      });
    } catch {
      setError("Не вдалося створити PDF.");
      setPdfReady(true);
      trackEvent("invoice_pdf_error", { stage: "redownload" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-ink print:bg-white">
      <div className="grid-atmosphere min-h-screen pb-28 print:bg-white print:pb-0 print:[background-image:none] md:pb-10">
        <div className="print:hidden">
          <SiteHeader />
        </div>

        <div className="mx-auto w-full max-w-content px-5 py-8 md:px-10 md:py-10">
          {/* Compact mobile header */}
          <div className="print:hidden mb-4 md:hidden">
            <h1 className="font-display text-2xl font-semibold text-paper">Рахунок PDF</h1>
            <div className="mt-3 flex gap-1.5" aria-label="Кроки">
              {MOBILE_STEPS.map((label, i) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    if (i <= mobileStep) {
                      setError("");
                      setMobileStep(i);
                    }
                  }}
                  className={`h-1.5 flex-1 rounded-full transition ${
                    i <= mobileStep ? "bg-signal" : "bg-white/15"
                  }`}
                  aria-label={`${i + 1}. ${label}`}
                />
              ))}
            </div>
            <p className="mt-2 text-sm text-mist">
              Крок {mobileStep + 1}/4 · {MOBILE_STEPS[mobileStep]}
            </p>
          </div>

          {/* Desktop header */}
          <div className="print:hidden mb-6 hidden flex-col gap-4 sm:flex-row sm:items-end sm:justify-between md:flex">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-signal">
                Безкоштовно · ~2 хвилини
              </p>
              <h1 className="mt-2 font-display text-3xl font-semibold text-paper md:text-4xl">
                Рахунок-фактура PDF для ФОП
              </h1>
              <p className="mt-2 max-w-xl text-mist">
                Заповніть реквізити → вкажіть email → скачайте PDF. Без Word, без Checkbox, без
                реєстрації. Лист — лише податкові нагадування (PDF у браузері).
              </p>
              <p className="mt-3 text-sm text-paper/80">
                1) ФОП і покупець · 2) позиції · 3) email + «Отримати PDF»
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

          <input
            ref={logoInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              void onLogoPicked(e.target.files?.[0] || null);
              e.target.value = "";
            }}
          />

          {/* —— Mobile wizard: one step per screen —— */}
          <div className="print:hidden mb-4 md:hidden">
            {mobileStep === 0 ? (
              <div className="space-y-3 rounded-2xl border border-white/10 bg-ink-2/80 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-display text-lg font-semibold text-paper">Ваш ФОП</p>
                  <select
                    className="min-h-10 rounded-lg border border-white/15 bg-ink px-2 text-sm text-paper"
                    value={data.fopGroup}
                    onChange={(e) => update("fopGroup", e.target.value as InvoiceData["fopGroup"])}
                    aria-label="Група ФОП"
                  >
                    <option value="">Група</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                  </select>
                </div>
                <MobileField label="ПІБ ФОП">
                  <input
                    className={mobileInput}
                    autoComplete="name"
                    placeholder="ПІБ ФОП"
                    value={data.sellerName}
                    onChange={(e) => update("sellerName", e.target.value)}
                  />
                </MobileField>
                <MobileField label="IBAN" hint="обовʼязково">
                  <input
                    className={`${mobileInput} font-mono tracking-wide`}
                    placeholder="UA00…"
                    autoComplete="off"
                    value={data.sellerIban}
                    onChange={(e) => update("sellerIban", formatIban(e.target.value))}
                  />
                </MobileField>
                <MobileField label="ІПН" hint="опційно">
                  <input
                    className={mobileInput}
                    inputMode="numeric"
                    placeholder="1234567890"
                    value={data.sellerTaxId}
                    onChange={(e) => update("sellerTaxId", formatTaxId(e.target.value))}
                  />
                </MobileField>
                <button
                  type="button"
                  onClick={() => setShowSellerExtra((v) => !v)}
                  className="text-sm text-signal"
                >
                  {showSellerExtra ? "Сховати додаткові" : "+ Банк, адреса, лого, №"}
                </button>
                {showSellerExtra ? (
                  <div className="space-y-3 border-t border-white/10 pt-3">
                    <div className="grid grid-cols-2 gap-2">
                      <MobileField label="№">
                        <input
                          className={mobileInput}
                          value={data.number}
                          onChange={(e) => update("number", e.target.value.slice(0, 20))}
                        />
                      </MobileField>
                      <MobileField label="Дата">
                        <input
                          className={mobileInput}
                          type="date"
                          value={data.date}
                          onChange={(e) => update("date", e.target.value)}
                        />
                      </MobileField>
                    </div>
                    <MobileField label="Банк">
                      <input
                        className={mobileInput}
                        placeholder="ПриватБанк"
                        value={data.sellerBank}
                        onChange={(e) => update("sellerBank", e.target.value)}
                      />
                    </MobileField>
                    <MobileField label="Адреса">
                      <input
                        className={mobileInput}
                        value={data.sellerAddress}
                        onChange={(e) => update("sellerAddress", e.target.value)}
                      />
                    </MobileField>
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="w-full rounded-xl border border-dashed border-white/25 py-3 text-sm text-mist"
                    >
                      {hasLogo ? "Змінити логотип" : "+ Логотип"}
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}

            {mobileStep === 1 ? (
              <div className="space-y-3 rounded-2xl border border-white/10 bg-ink-2/80 p-4">
                <p className="font-display text-lg font-semibold text-paper">Замовник</p>
                <MobileField label="Назва / ПІБ">
                  <input
                    className={mobileInput}
                    placeholder="ТОВ «Клієнт»"
                    value={data.buyerName}
                    onChange={(e) => update("buyerName", e.target.value)}
                  />
                </MobileField>
                <MobileField label="ЄДРПОУ / ІПН" hint="опційно">
                  <input
                    className={mobileInput}
                    inputMode="numeric"
                    value={data.buyerTaxId}
                    onChange={(e) => update("buyerTaxId", formatTaxId(e.target.value))}
                  />
                </MobileField>
                <MobileField label="Адреса" hint="опційно">
                  <input
                    className={mobileInput}
                    value={data.buyerAddress}
                    onChange={(e) => update("buyerAddress", e.target.value)}
                  />
                </MobileField>
              </div>
            ) : null}

            {mobileStep === 2 ? (
              <div className="space-y-3">
                {data.items.map((item, index) => (
                  <div
                    key={item.id}
                    className="space-y-3 rounded-2xl border border-white/10 bg-ink-2/80 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-display text-lg font-semibold text-paper">
                        Позиція {index + 1}
                      </p>
                      {data.items.length > 1 ? (
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-mist"
                          aria-label="Видалити"
                        >
                          ×
                        </button>
                      ) : null}
                    </div>
                    <MobileField label="Опис">
                      <input
                        className={mobileInput}
                        placeholder="Послуга / товар"
                        value={item.description}
                        onChange={(e) => updateItem(item.id, { description: e.target.value })}
                      />
                    </MobileField>
                    <div className="grid grid-cols-2 gap-2">
                      <MobileField label="К-сть">
                        <input
                          className={mobileInput}
                          inputMode="decimal"
                          value={item.qty}
                          onChange={(e) =>
                            updateItem(item.id, {
                              qty: e.target.value.replace(/[^\d.,]/g, "").slice(0, 12),
                            })
                          }
                        />
                      </MobileField>
                      <MobileField label="Ціна, грн">
                        <input
                          className={mobileInput}
                          inputMode="decimal"
                          value={item.price}
                          onChange={(e) =>
                            updateItem(item.id, {
                              price: e.target.value.replace(/[^\d.,]/g, "").slice(0, 14),
                            })
                          }
                        />
                      </MobileField>
                    </div>
                    <p className="text-right text-sm font-semibold text-paper">
                      {formatUah(calcLine(item))}
                    </p>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => update("items", [...data.items, emptyItem()])}
                  className="w-full rounded-xl border border-white/15 py-3 text-sm text-signal"
                >
                  + Ще позиція
                </button>
                <MobileField label="Призначення платежу">
                  <textarea
                    className={`${mobileInput} min-h-[4rem] resize-y`}
                    value={data.note}
                    onChange={(e) => update("note", e.target.value)}
                  />
                </MobileField>
                <p className="rounded-xl bg-signal/15 px-4 py-3 text-center font-display text-xl font-semibold text-paper">
                  {formatUah(total)}
                </p>
              </div>
            ) : null}

            {mobileStep === 3 ? (
              <div className="space-y-4 rounded-2xl border border-white/10 bg-ink-2/80 p-4">
                <p className="font-display text-lg font-semibold text-paper">Отримати PDF</p>
                <p className="text-sm text-mist">
                  {data.sellerName || "ФОП"} → {data.buyerName || "клієнт"} · {formatUah(total)}
                </p>
                {pdfReady ? (
                  <div className="rounded-xl border border-signal/40 bg-signal/10 p-4">
                    <p className="font-semibold text-paper">PDF готовий</p>
                    <button
                      type="button"
                      onClick={() => void downloadAgain()}
                      disabled={busy}
                      className="mt-3 w-full rounded-xl bg-signal py-3.5 font-semibold text-ink disabled:opacity-60"
                    >
                      {busy ? "…" : "Завантажити PDF"}
                    </button>
                  </div>
                ) : null}
                <MobileField label="Email" hint="податкові нагадування">
                  <input
                    className={mobileInput}
                    type="email"
                    autoComplete="email"
                    placeholder="you@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </MobileField>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void unlockAndDownload()}
                  className="w-full rounded-xl bg-signal py-4 text-base font-semibold text-ink disabled:opacity-60"
                >
                  {busy ? "…" : unlocked ? "Завантажити знову" : "Отримати PDF безкоштовно"}
                </button>
                {error ? <p className="text-sm text-red-300">{error}</p> : null}
                {okMsg ? <p className="text-sm text-signal">{okMsg}</p> : null}
              </div>
            ) : null}

            {mobileStep < 3 && error ? (
              <p className="mt-3 text-sm text-red-300">{error}</p>
            ) : null}
          </div>

          {/* Desktop logo controls */}
          <div className="print:hidden mx-auto mb-3 hidden w-full max-w-[210mm] flex-wrap items-center gap-3 md:flex">
            {hasLogo ? (
              <>
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="rounded-full border border-white/15 px-3 py-1.5 text-sm text-mist hover:border-signal hover:text-signal"
                >
                  Змінити логотип
                </button>
                <button
                  type="button"
                  onClick={() => update("sellerLogo", "")}
                  className="rounded-full border border-white/15 px-3 py-1.5 text-sm text-mist hover:border-signal hover:text-signal"
                >
                  Прибрати логотип
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="rounded-full border border-dashed border-white/25 px-3 py-1.5 text-sm text-mist hover:border-signal hover:text-signal"
              >
                + Логотип (опційно)
              </button>
            )}
          </div>

          {/* —— A4 проформа: editable on desktop; off-screen on mobile for PDF capture —— */}
          <div className="mx-auto w-full max-w-[210mm] overflow-x-auto max-md:pointer-events-none max-md:fixed max-md:left-[-9999px] max-md:top-0 max-md:z-[-1] md:relative md:left-auto md:z-auto md:pointer-events-auto">
            <div
              ref={previewRef}
              className="mx-auto w-[210mm] min-h-[297mm] bg-white text-[#111] shadow-[0_24px_80px_rgba(0,0,0,0.45)] print:shadow-none"
              style={{
                fontFamily: "Arial, Helvetica, sans-serif",
                padding: "14mm 14mm 12mm",
                boxSizing: "border-box",
              }}
            >
              {/* Title — classic UA: № + one date only (PDF flattens date → dd.mm.yyyy) */}
              <div className="border-b-2 border-neutral-900 pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    {hasLogo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={data.sellerLogo}
                        alt="Логотип ФОП на рахунку-фактурі"
                        className="mb-2 max-h-11 w-auto max-w-[140px] object-contain object-left"
                      />
                    ) : null}
                    <p className="text-[17px] font-bold uppercase tracking-[0.03em]">
                      Рахунок-проформа
                    </p>
                  </div>
                  <p className="shrink-0 pt-0.5 text-right text-[11px] leading-snug text-neutral-500">
                    Не є податковою
                    <br />
                    накладною
                  </p>
                </div>
                <div className="mt-2 flex flex-wrap items-end gap-x-3 gap-y-1 text-[14px]">
                  <span className="font-semibold text-neutral-800">№</span>
                  <input
                    className={`${lineInput} w-20 font-semibold`}
                    value={data.number}
                    onChange={(e) => update("number", e.target.value.slice(0, 20))}
                    aria-label="Номер рахунку"
                  />
                  <span className="font-semibold text-neutral-800">від</span>
                  <input
                    className={`${lineInput} w-[9.5rem]`}
                    type="date"
                    value={data.date}
                    onChange={(e) => update("date", e.target.value)}
                    aria-label="Дата рахунку"
                  />
                </div>
              </div>

              {/* Parties */}
              <div className="mt-4 grid grid-cols-2 gap-0 border border-neutral-800">
                <div className="border-r border-neutral-800 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-600">
                    Виконавець (постачальник)
                  </p>
                  <SoftField label="ФОП / назва" className="mt-2">
                    <input
                      className={`${lineInput} text-[15px] font-bold`}
                      placeholder="ПІБ ФОП"
                      value={data.sellerName}
                      onChange={(e) => update("sellerName", e.target.value)}
                    />
                  </SoftField>
                  <SoftField label="ІПН / ЄДРПОУ" className="mt-2">
                    <input
                      className={lineInput}
                      inputMode="numeric"
                      placeholder="1234567890"
                      value={data.sellerTaxId}
                      onChange={(e) => update("sellerTaxId", formatTaxId(e.target.value))}
                    />
                  </SoftField>
                  <SoftField label="Адреса" className="mt-2">
                    <input
                      className={lineInput}
                      placeholder="м. Київ…"
                      value={data.sellerAddress}
                      onChange={(e) => update("sellerAddress", e.target.value)}
                    />
                  </SoftField>
                  <SoftField label="Банк" className="mt-2">
                    <input
                      className={lineInput}
                      placeholder="ПриватБанк"
                      value={data.sellerBank}
                      onChange={(e) => update("sellerBank", e.target.value)}
                    />
                  </SoftField>
                  <SoftField label="IBAN" hint="обовʼязково" className="mt-2">
                    <input
                      className={`${lineInput} font-mono text-[12px] tracking-wide`}
                      placeholder="UA00 0000 …"
                      value={data.sellerIban}
                      onChange={(e) => update("sellerIban", formatIban(e.target.value))}
                    />
                  </SoftField>
                  {data.fopGroup ? (
                    <p className="mt-2 text-[11px] text-neutral-600">
                      Платник єдиного податку, {data.fopGroup} група. Без ПДВ.
                    </p>
                  ) : (
                    <p className="mt-2 text-[11px] text-neutral-500">Без ПДВ (за замовчуванням).</p>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-600">
                    Замовник (платник)
                  </p>
                  <SoftField label="Назва / ПІБ" className="mt-2">
                    <input
                      className={`${lineInput} text-[15px] font-bold`}
                      placeholder="ТОВ «Клієнт»"
                      value={data.buyerName}
                      onChange={(e) => update("buyerName", e.target.value)}
                    />
                  </SoftField>
                  <SoftField label="ІПН / ЄДРПОУ" hint="опційно" className="mt-2">
                    <input
                      className={lineInput}
                      inputMode="numeric"
                      value={data.buyerTaxId}
                      onChange={(e) => update("buyerTaxId", formatTaxId(e.target.value))}
                    />
                  </SoftField>
                  <SoftField label="Адреса" hint="опційно" className="mt-2">
                    <input
                      className={lineInput}
                      value={data.buyerAddress}
                      onChange={(e) => update("buyerAddress", e.target.value)}
                    />
                  </SoftField>
                </div>
              </div>

              {/* Lines table — grows freely; PDF slices across A4 pages */}
              <div className="mt-5">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-600">
                    Перелік товарів / послуг
                    <span className="ml-2 font-normal normal-case tracking-normal text-neutral-400">
                      ({data.items.length}{" "}
                      {data.items.length === 1
                        ? "позиція"
                        : data.items.length < 5
                          ? "позиції"
                          : "позицій"}
                      )
                    </span>
                  </p>
                  <button
                    type="button"
                    data-pdf-hide
                    onClick={() => update("items", [...data.items, emptyItem()])}
                    className="text-[12px] text-neutral-600 underline-offset-2 hover:text-neutral-900 hover:underline"
                  >
                    + рядок
                  </button>
                </div>

                <table className="w-full border-collapse border border-neutral-800 text-[12px]">
                  <thead>
                    <tr className="bg-neutral-100">
                      <th className="w-8 border border-neutral-800 px-1 py-1.5 text-center font-semibold">
                        №
                      </th>
                      <th className="border border-neutral-800 px-1.5 py-1.5 text-left font-semibold">
                        Найменування
                      </th>
                      <th className="w-16 border border-neutral-800 px-1 py-1.5 text-center font-semibold">
                        Од.
                      </th>
                      <th className="w-14 border border-neutral-800 px-1 py-1.5 text-center font-semibold">
                        К-сть
                      </th>
                      <th className="w-[72px] border border-neutral-800 px-1 py-1.5 text-right font-semibold">
                        Ціна
                      </th>
                      <th className="w-[84px] border border-neutral-800 px-1 py-1.5 text-right font-semibold">
                        Сума
                      </th>
                      <th
                        data-pdf-hide
                        className="w-7 border border-neutral-800 px-0 py-1.5 font-semibold"
                      />
                    </tr>
                  </thead>
                  <tbody>
                    {data.items.map((item, index) => (
                      <tr key={item.id}>
                        <td className="border border-neutral-800 px-1 py-1 text-center text-neutral-500">
                          {index + 1}
                        </td>
                        <td className="border border-neutral-800 p-0">
                          <input
                            data-pdf-cell
                            className={cellInput}
                            placeholder="Опис послуги / товару"
                            value={item.description}
                            onChange={(e) => updateItem(item.id, { description: e.target.value })}
                          />
                        </td>
                        <td className="border border-neutral-800 p-0">
                          <input
                            data-pdf-cell
                            className={`${cellInput} text-center`}
                            placeholder="шт."
                            aria-label="Одиниця"
                            value={item.unit || "послуга"}
                            onChange={(e) =>
                              updateItem(item.id, { unit: e.target.value.slice(0, 16) })
                            }
                          />
                        </td>
                        <td className="border border-neutral-800 p-0">
                          <input
                            data-pdf-cell
                            className={`${cellInput} text-center`}
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
                        </td>
                        <td className="border border-neutral-800 p-0">
                          <input
                            data-pdf-cell
                            className={`${cellInput} text-right`}
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
                        </td>
                        <td className="border border-neutral-800 px-1.5 py-1.5 text-right tabular-nums font-medium">
                          {formatUah(calcLine(item))}
                        </td>
                        <td data-pdf-hide className="border border-neutral-800 p-0 text-center">
                          <button
                            type="button"
                            aria-label="Видалити"
                            onClick={() => removeItem(item.id)}
                            className="px-1 text-neutral-400 hover:text-neutral-900"
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="mt-0 border border-t-0 border-neutral-800">
                  <div className="flex items-baseline justify-between gap-4 px-3 py-2">
                    <span className="text-[12px] font-semibold uppercase tracking-wide">
                      Всього до сплати
                    </span>
                    <span className="text-[20px] font-bold tabular-nums">{formatUah(total)}</span>
                  </div>
                  <div className="border-t border-neutral-300 px-3 py-2 text-[12px] leading-snug text-neutral-800">
                    <span className="font-semibold">Сума прописом: </span>
                    {words}
                  </div>
                </div>
              </div>

              <SoftField label="Призначення платежу / умови оплати" className="mt-4">
                <textarea
                  className={`${lineInput} min-h-[3rem] resize-y`}
                  value={data.note}
                  onChange={(e) => update("note", e.target.value)}
                />
              </SoftField>

              <div className="mt-8 grid grid-cols-2 gap-8 text-[12px]">
                <div>
                  <p className="font-semibold">Виконавець</p>
                  <p className="mt-6 border-b border-neutral-400 pb-1 text-neutral-500">
                    підпис / ПІБ
                  </p>
                </div>
                <div>
                  <p className="font-semibold">Замовник</p>
                  <p className="mt-6 border-b border-neutral-400 pb-1 text-neutral-500">
                    підпис / ПІБ
                  </p>
                </div>
              </div>

              <p className="mt-6 text-[9px] text-neutral-400">
                Сформовано через rakhuno.com. Не є податковою консультацією.
              </p>
            </div>
          </div>

          {/* Download / email — desktop only (mobile uses wizard step 4) */}
          <div className="mx-auto mt-8 hidden max-w-[210mm] print:hidden md:block">
            <div
              ref={readyRef}
              className="rounded-xl border border-white/10 bg-ink-2/80 p-4 sm:p-5"
            >
              {pdfReady ? (
                <div className="mb-4 rounded-lg border border-signal/40 bg-signal/10 p-4">
                  <p className="font-display text-lg font-semibold text-paper">PDF готовий</p>
                  <p className="mt-1 text-sm text-mist">
                    Файл у «Завантаженнях». Надішліть його клієнту (Telegram / email) і за бажанням
                    додайте реквізити текстом. У листі від Rakhuno PDF немає.
                  </p>
                  <button
                    type="button"
                    onClick={() => void downloadAgain()}
                    disabled={busy}
                    className="mt-3 w-full rounded-lg bg-signal px-4 py-3 font-semibold text-ink hover:bg-white disabled:opacity-60 sm:w-auto"
                  >
                    {busy ? "…" : "Завантажити PDF"}
                  </button>
                  {unlocked ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <a
                        href={`https://t.me/share/url?url=${encodeURIComponent("https://rakhuno.com/invoice")}&text=${encodeURIComponent(paymentText(data))}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackEvent("invoice_share_telegram")}
                        className="rounded-full border border-white/15 px-3 py-1.5 text-sm text-mist hover:border-signal hover:text-signal"
                      >
                        Реквізити в Telegram
                      </a>
                      <a
                        href={`mailto:?subject=${encodeURIComponent(`Рахунок № ${data.number}`)}&body=${encodeURIComponent(`${paymentText(data)}\n\nPDF у вкладенні (завантажте з браузера й додайте файл).`)}`}
                        onClick={() => trackEvent("invoice_share_email")}
                        className="rounded-full border border-white/15 px-3 py-1.5 text-sm text-mist hover:border-signal hover:text-signal"
                      >
                        Реквізити в email
                      </a>
                    </div>
                  ) : null}
                </div>
              ) : null}

              <p className="font-display text-lg font-semibold text-paper">
                Отримати PDF безкоштовно
              </p>
              <p className="mt-1 text-sm text-mist">
                Email потрібен для податкових нагадувань. PDF завантажиться одразу — у листі вкладення
                немає.
              </p>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (unlocked) void downloadAgain();
                      else void unlockAndDownload();
                    }
                  }}
                  className="w-full rounded-lg border border-white/15 bg-ink px-3.5 py-3.5 text-[16px] text-paper outline-none placeholder:text-muted focus:border-signal"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (unlocked) void downloadAgain();
                    else void unlockAndDownload();
                  }}
                  disabled={busy}
                  className="min-h-12 rounded-lg bg-signal px-5 py-3.5 text-base font-semibold text-ink transition hover:bg-white disabled:opacity-60 sm:min-h-0 sm:text-sm"
                >
                  {busy ? "…" : unlocked ? "Завантажити знову" : "Отримати PDF"}
                </button>
              </div>

              {unlocked ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(paymentText(data));
                        setCopied(true);
                        trackEvent("invoice_copy_payment");
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
                      setPdfReady(false);
                      setOkMsg("Новий рахунок-проформа.");
                      try {
                        window.sessionStorage.removeItem(LAST_PDF_META_KEY);
                      } catch {
                        /* ignore */
                      }
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

          <aside className="print:hidden mx-auto mt-14 hidden w-full max-w-[210mm] border-t border-line pt-8 md:block">
            <p className="font-display text-sm uppercase tracking-[0.18em] text-signal">
              Гіди для ФОП
            </p>
            <ul className="mt-4 space-y-3 text-mist">
              <li>
                <Link
                  href="/guides/vystavyty-rakhunok"
                  className="text-paper transition hover:text-signal"
                >
                  → Як виставити рахунок на оплату
                </Link>
              </li>
              <li>
                <Link
                  href="/guides/rahunok-faktura"
                  className="text-paper transition hover:text-signal"
                >
                  → Що таке рахунок-фактура для ФОП
                </Link>
              </li>
              <li>
                <Link
                  href="/guides/zrazok-rahunku-faktury"
                  className="text-paper transition hover:text-signal"
                >
                  → Зразок рахунку-фактури
                </Link>
              </li>
              <li>
                <Link href="/guides" className="text-paper transition hover:text-signal">
                  → Усі гіди
                </Link>
              </li>
            </ul>
          </aside>
        </div>
      </div>

      {/* Mobile wizard nav */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-ink/95 p-3 backdrop-blur md:hidden print:hidden">
        {mobileStep < 3 ? (
          <div className="flex gap-2">
            {mobileStep > 0 ? (
              <button
                type="button"
                onClick={goMobileBack}
                className="min-h-12 w-28 rounded-xl border border-white/20 px-3 text-base font-medium text-paper"
              >
                Назад
              </button>
            ) : null}
            <button
              type="button"
              onClick={goMobileNext}
              className="min-h-12 flex-1 rounded-xl bg-signal text-base font-semibold text-ink"
            >
              Далі · {MOBILE_STEPS[mobileStep + 1]}
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={goMobileBack}
              className="min-h-12 w-28 rounded-xl border border-white/20 px-3 text-base font-medium text-paper"
            >
              Назад
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                if (unlocked) void downloadAgain();
                else void unlockAndDownload();
              }}
              className="min-h-12 flex-1 rounded-xl bg-signal text-base font-semibold text-ink disabled:opacity-60"
            >
              {busy ? "…" : unlocked ? "Завантажити PDF" : `PDF · ${formatUah(total)}`}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
