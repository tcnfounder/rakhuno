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

function Field({
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
      <span className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium text-paper/90">{label}</span>
        {hint ? <span className="text-xs text-muted">{hint}</span> : null}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "field-input w-full rounded-lg border border-white/15 bg-[#0c1a15] px-3.5 py-3 text-[15px] leading-snug text-paper shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] outline-none transition placeholder:text-muted/80 focus:border-signal focus:ring-1 focus:ring-signal/40";

export default function InvoiceClient() {
  const previewRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [okMsg, setOkMsg] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

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
    setProfileSaved(true);
    window.setTimeout(() => setProfileSaved(false), 2000);
  }

  async function copyPayment() {
    try {
      await navigator.clipboard.writeText(paymentText(data));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Не вдалося скопіювати.");
    }
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
      setError("Щось пішло не так. Спробуйте ще раз.");
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

  function startNewInvoice() {
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
    setOkMsg("Новий рахунок — реквізити ФОП збережено.");
    setError("");
  }

  return (
    <main className="min-h-screen bg-ink print:bg-white">
      <div className="grid-atmosphere min-h-screen pb-28 print:bg-white print:pb-0 print:[background-image:none]">
        <div className="print:hidden">
          <SiteHeader />
        </div>

        <div className="mx-auto grid max-w-content gap-10 px-5 py-8 md:grid-cols-2 md:gap-12 md:px-10 md:py-10 print:block print:max-w-none print:px-0 print:py-0">
          <section className="print:hidden">
            <h1 className="font-display text-3xl font-semibold text-paper md:text-4xl">Рахунок-фактура</h1>
            <p className="mt-3 max-w-xl text-mist">
              Заповніть поля. Реквізити ФОП можна зберегти в браузері. PDF — після email.
            </p>

            <form onSubmit={unlockAndDownload} className="mt-8 space-y-8" noValidate>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Номер">
                  <input
                    className={inputClass}
                    inputMode="numeric"
                    autoComplete="off"
                    value={data.number}
                    onChange={(e) => update("number", e.target.value.replace(/[^\dA-Za-z\-_/]/g, "").slice(0, 20))}
                  />
                </Field>
                <Field label="Дата">
                  <input
                    className={`${inputClass} [color-scheme:dark]`}
                    type="date"
                    value={data.date}
                    onChange={(e) => update("date", e.target.value)}
                  />
                </Field>
                <Field label="Група ФОП" hint="для нагадувань">
                  <select
                    className={`${inputClass} [color-scheme:dark]`}
                    value={data.fopGroup}
                    onChange={(e) => update("fopGroup", e.target.value as InvoiceData["fopGroup"])}
                  >
                    <option value="">Не вказано</option>
                    <option value="2">2 група</option>
                    <option value="3">3 група</option>
                  </select>
                </Field>
              </div>

              <fieldset className="space-y-4 border-0 p-0">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <legend className="font-display text-lg text-signal">Виконавець (ФОП)</legend>
                  <button
                    type="button"
                    onClick={persistProfile}
                    className="rounded-full border border-white/15 px-3 py-1.5 text-sm text-mist transition hover:border-signal hover:text-signal"
                  >
                    {profileSaved ? "Збережено ✓" : "Зберегти реквізити"}
                  </button>
                </div>
                <Field label="ПІБ ФОП">
                  <input
                    className={inputClass}
                    autoComplete="name"
                    name="seller_name"
                    placeholder="Іваненко Іван Іванович"
                    value={data.sellerName}
                    onChange={(e) => update("sellerName", e.target.value)}
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="ІПН / ЄДРПОУ">
                    <input
                      className={inputClass}
                      inputMode="numeric"
                      autoComplete="off"
                      placeholder="1234567890"
                      value={data.sellerTaxId}
                      onChange={(e) => update("sellerTaxId", formatTaxId(e.target.value))}
                    />
                  </Field>
                  <Field label="Банк">
                    <input
                      className={inputClass}
                      autoComplete="organization"
                      placeholder="ПриватБанк"
                      value={data.sellerBank}
                      onChange={(e) => update("sellerBank", e.target.value)}
                    />
                  </Field>
                </div>
                <Field label="IBAN" hint="обовʼязково">
                  <input
                    className={`${inputClass} font-mono tracking-wide`}
                    autoComplete="off"
                    spellCheck={false}
                    placeholder="UA00 0000 0000 0000 0000 0000 000"
                    value={data.sellerIban}
                    onChange={(e) => update("sellerIban", formatIban(e.target.value))}
                  />
                </Field>
                <Field label="Адреса">
                  <input
                    className={inputClass}
                    autoComplete="street-address"
                    placeholder="м. Київ, вул. …"
                    value={data.sellerAddress}
                    onChange={(e) => update("sellerAddress", e.target.value)}
                  />
                </Field>
              </fieldset>

              <fieldset className="space-y-4 border-0 p-0">
                <legend className="font-display text-lg text-signal">Замовник</legend>
                <Field label="Назва / ПІБ">
                  <input
                    className={inputClass}
                    autoComplete="organization"
                    placeholder="ТОВ «Клієнт»"
                    value={data.buyerName}
                    onChange={(e) => update("buyerName", e.target.value)}
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="ІПН / ЄДРПОУ">
                    <input
                      className={inputClass}
                      inputMode="numeric"
                      placeholder="опційно"
                      value={data.buyerTaxId}
                      onChange={(e) => update("buyerTaxId", formatTaxId(e.target.value))}
                    />
                  </Field>
                  <Field label="Адреса">
                    <input
                      className={inputClass}
                      placeholder="опційно"
                      value={data.buyerAddress}
                      onChange={(e) => update("buyerAddress", e.target.value)}
                    />
                  </Field>
                </div>
              </fieldset>

              <fieldset className="space-y-4 border-0 p-0">
                <div className="flex items-center justify-between gap-3">
                  <legend className="font-display text-lg text-signal">Позиції</legend>
                  <button
                    type="button"
                    className="rounded-full border border-white/15 px-3 py-1.5 text-sm text-mist transition hover:border-signal hover:text-signal"
                    onClick={() => update("items", [...data.items, emptyItem()])}
                  >
                    + рядок
                  </button>
                </div>

                <div className="space-y-3">
                  {data.items.map((item, index) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-white/10 bg-black/20 p-3 sm:p-4"
                    >
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <p className="text-xs uppercase tracking-wider text-muted">Рядок {index + 1}</p>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="rounded-md px-2 py-1 text-sm text-muted transition hover:bg-white/5 hover:text-signal"
                        >
                          Видалити
                        </button>
                      </div>
                      <Field label="Опис">
                        <input
                          className={inputClass}
                          placeholder="Розробка лендінгу"
                          value={item.description}
                          onChange={(e) => updateItem(item.id, { description: e.target.value })}
                        />
                      </Field>
                      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                        <Field label="Кількість">
                          <input
                            className={inputClass}
                            inputMode="decimal"
                            autoComplete="off"
                            placeholder="1"
                            value={item.qty}
                            onChange={(e) =>
                              updateItem(item.id, {
                                qty: e.target.value.replace(/[^\d.,]/g, "").slice(0, 12),
                              })
                            }
                          />
                        </Field>
                        <Field label="Ціна, грн">
                          <input
                            className={inputClass}
                            inputMode="decimal"
                            autoComplete="off"
                            placeholder="0"
                            value={item.price}
                            onChange={(e) =>
                              updateItem(item.id, {
                                price: e.target.value.replace(/[^\d.,]/g, "").slice(0, 14),
                              })
                            }
                          />
                        </Field>
                        <div className="col-span-2 sm:col-span-1 sm:min-w-[7.5rem] sm:pb-3">
                          <p className="text-xs text-muted">Сума</p>
                          <p className="mt-1 font-display text-base text-paper">{formatUah(calcLine(item))}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-baseline justify-between border-t border-white/10 pt-4">
                  <p className="text-sm text-muted">Разом</p>
                  <p className="font-display text-2xl text-paper">{formatUah(total)}</p>
                </div>
              </fieldset>

              <Field label="Примітка">
                <textarea
                  className={`${inputClass} min-h-[5.5rem] resize-y`}
                  value={data.note}
                  onChange={(e) => update("note", e.target.value)}
                />
              </Field>

              <div className="space-y-3 border-t border-white/10 pt-6">
                <Field label="Email" hint="для PDF і нагадувань">
                  <input
                    required
                    type="email"
                    className={inputClass}
                    placeholder="you@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </Field>

                <div className="hidden gap-3 sm:flex">
                  {unlocked ? (
                    <>
                      <button
                        type="button"
                        onClick={downloadAgain}
                        className="rounded-lg bg-signal px-5 py-3 font-semibold text-ink transition hover:bg-white"
                      >
                        Завантажити знову
                      </button>
                      <button
                        type="button"
                        onClick={copyPayment}
                        className="rounded-lg border border-white/15 px-4 py-3 text-sm text-mist transition hover:border-signal hover:text-signal"
                      >
                        {copied ? "Скопійовано ✓" : "Копіювати реквізити"}
                      </button>
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="rounded-lg border border-white/15 px-4 py-3 text-sm text-mist transition hover:border-signal hover:text-signal"
                      >
                        Друк
                      </button>
                      <button
                        type="button"
                        onClick={startNewInvoice}
                        className="rounded-lg border border-white/15 px-4 py-3 text-sm text-mist transition hover:border-signal hover:text-signal"
                      >
                        Новий рахунок
                      </button>
                    </>
                  ) : (
                    <button
                      type="submit"
                      disabled={busy}
                      className="rounded-lg bg-signal px-5 py-3 font-semibold text-ink transition hover:bg-white disabled:opacity-60"
                    >
                      {busy ? "Готуємо…" : "Отримати PDF"}
                    </button>
                  )}
                </div>

                {error ? <p className="text-sm text-red-300">{error}</p> : null}
                {okMsg ? <p className="text-sm text-signal">{okMsg}</p> : null}
              </div>
            </form>
          </section>

          <section className="md:sticky md:top-6 md:self-start print:static">
            <p className="mb-3 text-sm text-muted print:hidden">Попередній перегляд</p>
            <div
              ref={previewRef}
              className="rounded-sm bg-white p-6 text-[#111] shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:p-8 print:shadow-none"
              style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
            >
              <div className="flex items-start justify-between gap-4 border-b border-neutral-200 pb-4">
                <div className="min-w-0 pr-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Рахунок-фактура
                  </p>
                  <p className="mt-2 text-xl font-bold leading-snug tracking-tight">
                    {data.sellerName.trim() || "ФОП (вкажіть ПІБ)"}
                  </p>
                  {data.sellerTaxId ? (
                    <p className="mt-1 text-sm text-neutral-600">ІПН/ЄДРПОУ: {data.sellerTaxId}</p>
                  ) : null}
                </div>
                <div className="shrink-0 text-right text-sm">
                  <p>
                    <span className="text-neutral-500">№ </span>
                    {data.number || "—"}
                  </p>
                  <p className="mt-1">від {formatDateUk(data.date)}</p>
                </div>
              </div>

              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Постачальник
                  </p>
                  <p className="mt-2 font-semibold">{data.sellerName || "—"}</p>
                  {data.sellerAddress ? <p className="text-sm">{data.sellerAddress}</p> : null}
                  {data.sellerIban ? <p className="text-sm">IBAN: {data.sellerIban}</p> : null}
                  {data.sellerBank ? <p className="text-sm">Банк: {data.sellerBank}</p> : null}
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Платник / замовник
                  </p>
                  <p className="mt-2 font-semibold">{data.buyerName || "—"}</p>
                  {data.buyerTaxId ? <p className="text-sm">ІПН/ЄДРПОУ: {data.buyerTaxId}</p> : null}
                  {data.buyerAddress ? <p className="text-sm">{data.buyerAddress}</p> : null}
                </div>
              </div>

              <table className="mt-8 w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 text-neutral-500">
                    <th className="py-2 pr-2 font-medium">№</th>
                    <th className="py-2 font-medium">Опис</th>
                    <th className="py-2 font-medium">К-сть</th>
                    <th className="py-2 font-medium">Ціна</th>
                    <th className="py-2 font-medium">Сума</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item, index) => (
                    <tr key={item.id} className="border-b border-neutral-100 align-top">
                      <td className="py-2 pr-2 text-neutral-500">{index + 1}</td>
                      <td className="py-2 pr-2">{item.description || "—"}</td>
                      <td className="py-2">{item.qty || "0"}</td>
                      <td className="py-2">
                        {item.price === "" ? "—" : formatUah(parseAmount(item.price))}
                      </td>
                      <td className="py-2">{formatUah(calcLine(item))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <p className="mt-6 text-right text-lg font-bold">До сплати: {formatUah(total)}</p>
              {data.note ? <p className="mt-6 text-sm text-neutral-600">Примітка: {data.note}</p> : null}
              <p className="mt-10 text-[10px] text-neutral-400">
                Документ сформовано через rakhuno.com. Не є податковою консультацією.
              </p>
            </div>
          </section>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-ink/95 p-3 backdrop-blur sm:hidden print:hidden">
        {unlocked ? (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={downloadAgain}
              className="flex-1 rounded-lg bg-signal py-3 font-semibold text-ink"
            >
              PDF знову
            </button>
            <button
              type="button"
              onClick={startNewInvoice}
              className="rounded-lg border border-white/15 px-4 py-3 text-sm text-paper"
            >
              Новий
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              const form = document.querySelector("form");
              form?.requestSubmit();
            }}
            className="w-full rounded-lg bg-signal py-3.5 font-semibold text-ink disabled:opacity-60"
          >
            {busy ? "Готуємо…" : `Отримати PDF · ${formatUah(total)}`}
          </button>
        )}
      </div>
    </main>
  );
}
