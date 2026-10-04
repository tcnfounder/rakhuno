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
    readyRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [pdfReady]);

  const total = useMemo(() => calcTotal(data.items), [data.items]);
  const hasLogo = Boolean(data.sellerLogo);
  const words = useMemo(() => amountInWordsUk(total), [total]);

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
      <div className="grid-atmosphere min-h-screen pb-28 print:bg-white print:pb-0 print:[background-image:none]">
        <div className="print:hidden">
          <SiteHeader />
        </div>

        <div className="mx-auto w-full max-w-content px-5 py-8 md:px-10 md:py-10">
          <div className="print:hidden mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
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

          <div className="print:hidden mx-auto mb-3 flex w-full max-w-[210mm] flex-wrap items-center gap-3">
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

          {/* —— A4 проформа —— */}
          <div className="mx-auto w-full max-w-[210mm] overflow-x-auto">
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

          {/* Download / email — inline success, no overlay (adblock-safe) */}
          <div className="mx-auto mt-8 max-w-[210mm] print:hidden">
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
                  className="w-full rounded-lg border border-white/15 bg-ink px-3.5 py-3 text-paper outline-none placeholder:text-muted focus:border-signal"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (unlocked) void downloadAgain();
                    else void unlockAndDownload();
                  }}
                  disabled={busy}
                  className="rounded-lg bg-signal px-5 py-3 font-semibold text-ink transition hover:bg-white disabled:opacity-60"
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

          <aside className="print:hidden mx-auto mt-14 w-full max-w-[210mm] border-t border-line pt-8">
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

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-ink/95 p-3 backdrop-blur sm:hidden print:hidden">
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            if (unlocked) void downloadAgain();
            else void unlockAndDownload();
          }}
          className="w-full rounded-lg bg-signal py-3.5 font-semibold text-ink disabled:opacity-60"
        >
          {busy
            ? "…"
            : unlocked
              ? `Завантажити PDF · ${formatUah(total)}`
              : `PDF безкоштовно · ${formatUah(total)}`}
        </button>
      </div>
    </main>
  );
}
