"use client";

import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useRef, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import {
  formatIban,
  formatTaxId,
  formatUah,
  loadSellerProfile,
  parseAmount,
  saveInvoiceDraft,
  saveSellerProfile,
} from "@/lib/invoice";

const input =
  "w-full rounded-xl border border-white/15 bg-ink px-3 py-2.5 text-[15px] leading-snug text-paper outline-none placeholder:text-muted focus:border-signal";

function Field({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.08em] text-mist">{label}</span>
      {children}
    </label>
  );
}

/**
 * Short invoice form for invoice guide pages. Template seekers fill the essentials here,
 * then land on /invoice with everything prefilled, one step from the email gate and PDF.
 */
export function InvoiceQuickStart({
  from,
  title = "Заповнити рахунок онлайн",
  text = "Без Word: впишіть свої реквізити, клієнта й суму — наступним кроком отримаєте готовий PDF з QR для оплати.",
}: {
  /** Guide path, e.g. /guides/zrazok-rahunku-faktury. */
  from: string;
  title?: string;
  text?: string;
}) {
  const router = useRouter();
  const started = useRef(false);
  const [sellerName, setSellerName] = useState("");
  const [sellerTaxId, setSellerTaxId] = useState("");
  const [sellerIban, setSellerIban] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const profile = loadSellerProfile();
    if (profile?.sellerName) setSellerName(profile.sellerName);
    if (profile?.sellerTaxId) setSellerTaxId(profile.sellerTaxId);
    if (profile?.sellerIban) setSellerIban(profile.sellerIban);
  }, []);

  function markStart() {
    if (started.current) return;
    started.current = true;
    trackEvent("doc_fill_start", { doc_type: "invoice", from });
  }

  function validate(): string | null {
    if (!sellerName.trim()) return "Вкажіть ПІБ ФОП.";
    if (sellerIban.replace(/\s/g, "").length < 15) return "Вкажіть IBAN, на який клієнт заплатить.";
    if (!buyerName.trim()) return "Вкажіть клієнта (покупця).";
    if (!description.trim()) return "Опишіть товар або послугу.";
    if (!(parseAmount(price) > 0)) return "Вкажіть суму, грн.";
    return null;
  }

  function onContinue() {
    setError("");
    const invalid = validate();
    if (invalid) {
      setError(invalid);
      return;
    }
    const profile = loadSellerProfile() || {};
    saveSellerProfile({
      sellerLogo: profile.sellerLogo || "",
      sellerAddress: profile.sellerAddress || "",
      sellerBank: profile.sellerBank || "",
      fopGroup: profile.fopGroup || "",
      sellerName: sellerName.trim(),
      sellerTaxId,
      sellerIban,
    });
    saveInvoiceDraft({
      buyerName: buyerName.trim(),
      buyerTaxId: "",
      items: [{ id: "draft-1", description: description.trim(), unit: "послуга", qty: "1", price: price.trim() }],
      from,
    });
    trackEvent("invoice_quickstart_submit", { from });
    router.push("/invoice");
  }

  const amount = parseAmount(price);

  return (
    <section
      id="online"
      className="not-prose my-8 scroll-mt-24 rounded-2xl border border-signal/40 bg-signal/5 px-4 py-5 md:px-6"
      onFocusCapture={markStart}
      aria-labelledby="fill-invoice"
    >
      <h2 id="fill-invoice" className="font-display text-xl text-paper md:text-2xl">
        {title}
      </h2>
      <p className="mt-1 text-sm text-mist">{text}</p>

      <form
        className="mt-5 grid gap-3 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          onContinue();
        }}
      >
        <Field label="ФОП (ПІБ)">
          <input className={input} value={sellerName} onChange={(e) => setSellerName(e.target.value)} placeholder="Петренко Петро Петрович" autoComplete="name" />
        </Field>
        <Field label="РНОКПП ФОП">
          <input className={input} value={sellerTaxId} onChange={(e) => setSellerTaxId(formatTaxId(e.target.value))} placeholder="1234567890" inputMode="numeric" />
        </Field>
        <Field label="IBAN ФОП" className="sm:col-span-2">
          <input className={input} value={sellerIban} onChange={(e) => setSellerIban(formatIban(e.target.value))} placeholder="UA21 3223 1300 0002 6007 2335 6600 1" autoComplete="off" spellCheck={false} />
        </Field>
        <Field label="Клієнт (покупець)" className="sm:col-span-2">
          <input className={input} value={buyerName} onChange={(e) => setBuyerName(e.target.value)} placeholder="ТОВ «Приклад»" />
        </Field>
        <Field label="Товар або послуга">
          <input className={input} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Розробка сайту, жовтень 2026" />
        </Field>
        <Field label="Сума, грн">
          <input className={input} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="15000" inputMode="decimal" />
        </Field>

        <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-mist">{amount > 0 ? `Разом: ${formatUah(amount)}, без ПДВ` : "Більше позицій додасте на наступному кроці."}</p>
          <button
            type="submit"
            className="inline-flex justify-center rounded-full bg-signal px-6 py-3 font-semibold text-ink transition hover:bg-signal-deep"
          >
            Далі: отримати PDF →
          </button>
        </div>
      </form>
      {error ? <p className="mt-3 text-sm text-red-300" role="alert">{error}</p> : null}
      <p className="mt-3 text-xs text-muted">
        Безкоштовно. Реквізити лишаються у вашому браузері; email попросимо лише перед завантаженням PDF — для нагадувань про єдиний податок і ЄСВ.
      </p>
    </section>
  );
}
