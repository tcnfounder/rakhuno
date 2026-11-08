"use client";

import Link from "next/link";
import { ReactNode, useEffect, useRef, useState } from "react";
import { ActDocument } from "@/components/ActDocument";
import {
  NakladnaDocument,
  ZvirkaDocument,
  ZvirkaRow,
  zvirkaConclusion,
  zvirkaTotals,
} from "@/components/DocDocuments";
import { trackMetaLead } from "@/components/MetaPixel";
import {
  getCampaignParams,
  leadTransactionId,
  trackAdsConversion,
  trackEvent,
} from "@/lib/analytics";
import {
  InvoiceData,
  InvoiceItem,
  calcLine,
  calcTotal,
  emptyItem,
  formatTaxId,
  formatUah,
  loadSellerProfile,
  newId,
  parseAmount,
  saveSellerProfile,
  todayIso,
} from "@/lib/invoice";
import { markPendingLead, submitInvoiceLead, takePendingLead } from "@/lib/invoice-lead";
import { PdfResult, downloadNodePdf, downloadPdfBlob } from "@/lib/pdf";

export type DocKind = "nakladna" | "akt" | "akt-zvirky";

const DOCS: Record<
  DocKind,
  { title: string; text: string; prefix: string; itemLabel: string; unit: string; basisHint: string }
> = {
  nakladna: {
    title: "Заповнити видаткову накладну онлайн",
    text: "Без Word: впишіть сторони й товари — готовий PDF з сумою прописом за хвилину.",
    prefix: "nakladna",
    itemLabel: "Товар",
    unit: "шт.",
    basisHint: "напр. рахунок-фактура № 18 від 10.10.2026",
  },
  akt: {
    title: "Заповнити акт виконаних робіт онлайн",
    text: "Без Word: впишіть сторони й послуги — готовий PDF акту з сумою прописом за хвилину.",
    prefix: "akt",
    itemLabel: "Послуга (робота)",
    unit: "послуга",
    basisHint: "напр. договору № 4 від 01.09.2026",
  },
  "akt-zvirky": {
    title: "Скласти акт звірки онлайн",
    text: "Впишіть сальдо й операції — сальдо на кінець і висновок порахуються самі. Готовий PDF за хвилину.",
    prefix: "akt-zvirky",
    itemLabel: "Документ",
    unit: "",
    basisHint: "напр. договором № 4 від 01.09.2026",
  },
};

const input =
  "w-full rounded-xl border border-white/15 bg-ink px-3 py-2.5 text-[15px] leading-snug text-paper outline-none placeholder:text-muted focus:border-signal";
const smallInput =
  "w-full rounded-lg border border-white/15 bg-ink px-2.5 py-2 text-[14px] text-paper outline-none placeholder:text-muted focus:border-signal";

function Field({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.08em] text-mist">{label}</span>
      {children}
    </label>
  );
}

function monthStartIso() {
  const d = new Date();
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), 1)).toISOString().slice(0, 10);
}

function emptyRow(): ZvirkaRow {
  return { id: newId(), date: "", doc: "", debit: "", credit: "" };
}

/**
 * Inline document generator for guide pages. Template seekers land on the guide and
 * download a Word blank; this lets them fill the same document in place and get a PDF
 * behind the same email gate as /invoice (lead source `<kind>_pdf`).
 */
export function DocQuickFill({ kind }: { kind: DocKind }) {
  const doc = DOCS[kind];
  const docRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  const [number, setNumber] = useState("1");
  const [date, setDate] = useState(todayIso());
  const [sellerName, setSellerName] = useState("");
  const [sellerTaxId, setSellerTaxId] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [buyerTaxId, setBuyerTaxId] = useState("");
  const [basis, setBasis] = useState("");
  const [items, setItems] = useState<InvoiceItem[]>([{ ...emptyItem("doc-line-1"), unit: doc.unit }]);
  const [periodFrom, setPeriodFrom] = useState(monthStartIso());
  const [periodTo, setPeriodTo] = useState(todayIso());
  const [opening, setOpening] = useState("0");
  const [rows, setRows] = useState<ZvirkaRow[]>([{ id: "doc-row-1", date: "", doc: "", debit: "", credit: "" }]);

  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<PdfResult | null>(null);

  useEffect(() => {
    const profile = loadSellerProfile();
    if (profile?.sellerName) setSellerName(profile.sellerName);
    if (profile?.sellerTaxId) setSellerTaxId(profile.sellerTaxId);
  }, []);

  function markStart() {
    if (started.current) return;
    started.current = true;
    trackEvent("doc_fill_start", { doc_type: kind });
  }

  const party = { number, date, sellerName, sellerTaxId, buyerName, buyerTaxId, basis };
  const total = kind === "akt-zvirky" ? 0 : calcTotal(items);

  const actData: InvoiceData = {
    number,
    date,
    sellerLogo: "",
    sellerName,
    sellerTaxId,
    sellerAddress: "",
    sellerIban: "",
    sellerBank: "",
    buyerName,
    buyerTaxId,
    buyerAddress: "",
    items,
    note: "",
    fopGroup: "",
  };
  const zvirka = { ...party, periodFrom, periodTo, opening, rows };

  function validate(): string | null {
    if (!sellerName.trim()) return "Вкажіть ПІБ ФОП.";
    if (!buyerName.trim()) return kind === "akt" ? "Вкажіть замовника." : "Вкажіть покупця (контрагента).";
    if (kind === "akt-zvirky") {
      if (!periodFrom || !periodTo) return "Вкажіть період звірки.";
      if (periodFrom > periodTo) return "Початок періоду пізніше за кінець.";
      if (!zvirkaTotals(zvirka).rows.length && !parseAmount(opening)) return "Додайте хоча б одну операцію.";
      return null;
    }
    const lines = items.filter((i) => i.description.trim());
    if (!lines.length) return `Додайте позицію: ${doc.itemLabel.toLowerCase()}.`;
    for (const line of lines) {
      if (!(parseAmount(line.qty) > 0)) return "Кількість має бути більше 0.";
      if (line.price.trim() === "" || parseAmount(line.price) < 0) return "Вкажіть ціну для кожної позиції.";
    }
    return null;
  }

  async function makePdf() {
    const node = docRef.current;
    if (!node) throw new Error("doc_missing");
    const result = await downloadNodePdf(node, doc.prefix, number);
    setDone(result);
    return result;
  }

  async function onGetPdf() {
    setError("");
    const invalid = validate();
    if (invalid) {
      setError(invalid);
      return;
    }
    if (!done && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Вкажіть email — надішлемо податкові нагадування для ФОП.");
      return;
    }
    setBusy(true);
    try {
      if (!done) {
        const created = await submitInvoiceLead(email, undefined, `${doc.prefix}_pdf`).catch(() => false);
        if (created) markPendingLead(email);
        const profile = loadSellerProfile() || {};
        saveSellerProfile({
          sellerLogo: profile.sellerLogo || "",
          sellerAddress: profile.sellerAddress || "",
          sellerIban: profile.sellerIban || "",
          sellerBank: profile.sellerBank || "",
          fopGroup: profile.fopGroup || "",
          sellerName,
          sellerTaxId,
        });
        await makePdf();
        trackEvent("doc_pdf_unlock", { doc_type: kind });
        if (takePendingLead(email)) {
          trackEvent("generate_lead", { method: `${doc.prefix}_pdf`, ...getCampaignParams() });
          await trackAdsConversion(email);
          trackMetaLead(await leadTransactionId(email));
        }
      } else {
        // Edited after the first PDF: rebuild so the file matches the form.
        await makePdf();
        trackEvent("doc_pdf_redownload", { doc_type: kind });
      }
    } catch {
      setError("Не вдалося створити PDF. Спробуйте ще раз.");
      trackEvent("doc_pdf_error", { doc_type: kind });
    } finally {
      setBusy(false);
    }
  }

  function updateItem(id: string, key: keyof InvoiceItem, value: string) {
    setItems((list) => list.map((i) => (i.id === id ? { ...i, [key]: value } : i)));
  }
  function updateRow(id: string, key: keyof ZvirkaRow, value: string) {
    setRows((list) => list.map((r) => (r.id === id ? { ...r, [key]: value } : r)));
  }

  return (
    <section
      id="online"
      className="not-prose my-8 scroll-mt-24 rounded-2xl border border-signal/40 bg-signal/5 px-4 py-5 md:px-6"
      onFocusCapture={markStart}
      aria-labelledby={`fill-${kind}`}
    >
      <h2 id={`fill-${kind}`} className="font-display text-xl text-paper md:text-2xl">
        {doc.title}
      </h2>
      <p className="mt-1 text-sm text-mist">{doc.text}</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Field label="ФОП (ПІБ)">
          <input className={input} value={sellerName} onChange={(e) => setSellerName(e.target.value)} placeholder="Петренко Петро Петрович" autoComplete="name" />
        </Field>
        <Field label="РНОКПП ФОП">
          <input className={input} value={sellerTaxId} onChange={(e) => setSellerTaxId(formatTaxId(e.target.value))} placeholder="1234567890" inputMode="numeric" />
        </Field>
        <Field label={kind === "akt" ? "Замовник" : kind === "nakladna" ? "Покупець" : "Контрагент"}>
          <input className={input} value={buyerName} onChange={(e) => setBuyerName(e.target.value)} placeholder="ТОВ «Приклад»" />
        </Field>
        <Field label="Код ЄДРПОУ / РНОКПП">
          <input className={input} value={buyerTaxId} onChange={(e) => setBuyerTaxId(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="12345678" inputMode="numeric" />
        </Field>
        <Field label="Номер">
          <input className={input} value={number} onChange={(e) => setNumber(e.target.value.slice(0, 20))} />
        </Field>
        <Field label="Дата">
          <input className={input} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Field label={kind === "akt-zvirky" ? "Договір (необов’язково)" : "Підстава (необов’язково)"} className="sm:col-span-2">
          <input className={input} value={basis} onChange={(e) => setBasis(e.target.value)} placeholder={doc.basisHint} />
        </Field>
      </div>

      {kind === "akt-zvirky" ? (
        <div className="mt-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Період з">
              <input className={input} type="date" value={periodFrom} onChange={(e) => setPeriodFrom(e.target.value)} />
            </Field>
            <Field label="по">
              <input className={input} type="date" value={periodTo} onChange={(e) => setPeriodTo(e.target.value)} />
            </Field>
            <Field label="Сальдо на початок, грн">
              <input className={input} value={opening} onChange={(e) => setOpening(e.target.value)} inputMode="decimal" placeholder="0" />
            </Field>
          </div>
          <p className="mt-2 text-xs text-muted">
            Сальдо: плюс — контрагент винен вам, мінус — ви винні контрагенту. Дебет — акти й накладні, кредит — оплати.
          </p>
          <div className="mt-3 space-y-3">
            {rows.map((r, i) => (
              <div key={r.id} className="grid grid-cols-2 gap-2 rounded-xl border border-white/10 p-3 sm:grid-cols-[8.5rem_1fr_7rem_7rem_2rem]">
                <input className={`${smallInput} order-1`} type="date" value={r.date} onChange={(e) => updateRow(r.id, "date", e.target.value)} aria-label={`Дата операції ${i + 1}`} />
                <input className={`${smallInput} order-3 col-span-2 sm:order-2 sm:col-span-1`} value={r.doc} onChange={(e) => updateRow(r.id, "doc", e.target.value)} placeholder="Акт № 5 / Оплата, п/і № 841" aria-label={`Документ ${i + 1}`} />
                <input className={`${smallInput} order-4 sm:order-3`} value={r.debit} onChange={(e) => updateRow(r.id, "debit", e.target.value)} placeholder="Дебет" inputMode="decimal" aria-label={`Дебет ${i + 1}`} />
                <input className={`${smallInput} order-5 sm:order-4`} value={r.credit} onChange={(e) => updateRow(r.id, "credit", e.target.value)} placeholder="Кредит" inputMode="decimal" aria-label={`Кредит ${i + 1}`} />
                <button type="button" className="order-2 justify-self-end px-2 text-lg text-muted hover:text-paper sm:order-5" onClick={() => setRows((l) => (l.length > 1 ? l.filter((x) => x.id !== r.id) : l))} aria-label={`Видалити рядок ${i + 1}`}>
                  ×
                </button>
              </div>
            ))}
          </div>
          <button type="button" className="mt-3 text-sm font-semibold text-signal hover:underline" onClick={() => setRows((l) => [...l, emptyRow()])}>
            + Додати операцію
          </button>
          <p className="mt-3 text-sm text-paper">{zvirkaConclusion(zvirka)}</p>
        </div>
      ) : (
        <div className="mt-5">
          <div className="space-y-3">
            {items.map((item, i) => (
              <div key={item.id} className="grid grid-cols-3 gap-2 rounded-xl border border-white/10 p-3 sm:grid-cols-[1fr_6rem_5rem_7rem_2rem]">
                <input className={`${smallInput} order-1 col-span-2 sm:col-span-1`} value={item.description} onChange={(e) => updateItem(item.id, "description", e.target.value)} placeholder={doc.itemLabel} aria-label={`${doc.itemLabel} ${i + 1}`} />
                <input className={`${smallInput} order-3 sm:order-2`} value={item.unit} onChange={(e) => updateItem(item.id, "unit", e.target.value)} placeholder="од." aria-label={`Одиниця ${i + 1}`} />
                <input className={`${smallInput} order-4 sm:order-3`} value={item.qty} onChange={(e) => updateItem(item.id, "qty", e.target.value)} placeholder="К-сть" inputMode="decimal" aria-label={`Кількість ${i + 1}`} />
                <input className={`${smallInput} order-5 sm:order-4`} value={item.price} onChange={(e) => updateItem(item.id, "price", e.target.value)} placeholder="Ціна, грн" inputMode="decimal" aria-label={`Ціна ${i + 1}`} />
                <button type="button" className="order-2 justify-self-end px-2 text-lg text-muted hover:text-paper sm:order-5" onClick={() => setItems((l) => (l.length > 1 ? l.filter((x) => x.id !== item.id) : l))} aria-label={`Видалити позицію ${i + 1}`}>
                  ×
                </button>
                {calcLine(item) > 0 ? (
                  <p className="order-6 col-span-3 text-right text-xs text-muted sm:col-span-5">{formatUah(calcLine(item))}</p>
                ) : null}
              </div>
            ))}
          </div>
          <button type="button" className="mt-3 text-sm font-semibold text-signal hover:underline" onClick={() => setItems((l) => [...l, { ...emptyItem(), unit: doc.unit }])}>
            + Додати позицію
          </button>
          <p className="mt-3 text-right font-display text-lg text-paper">Разом: {formatUah(total)}</p>
        </div>
      )}

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
        {!done ? (
          <Field label="Email для PDF і податкових нагадувань" className="flex-1">
            <input className={input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
          </Field>
        ) : null}
        <button
          type="button"
          onClick={() => void onGetPdf()}
          disabled={busy}
          className="inline-flex justify-center rounded-full bg-signal px-6 py-3 font-semibold text-ink transition hover:bg-signal-deep disabled:opacity-60"
        >
          {busy ? "…" : done ? "Оновити PDF" : "Отримати PDF безкоштовно"}
        </button>
      </div>
      {error ? <p className="mt-3 text-sm text-red-300" role="alert">{error}</p> : null}

      {done ? (
        <div className="mt-4 rounded-xl border border-white/10 p-4 text-sm text-mist" role="status">
          <p className="text-paper">
            PDF готовий.{" "}
            <button type="button" className="font-semibold text-signal hover:underline" onClick={() => downloadPdfBlob(done.blob, done.filename)}>
              Завантажити ще раз
            </button>
          </p>
          <p className="mt-2">
            Ваші реквізити збережено в цьому браузері. Потрібен рахунок на оплату цьому ж клієнту?{" "}
            <Link href="/invoice" className="font-semibold text-signal hover:underline" onClick={() => trackEvent("doc_to_invoice", { doc_type: kind })}>
              Створити рахунок-фактуру →
            </Link>
          </p>
        </div>
      ) : (
        <p className="mt-3 text-xs text-muted">
          Безкоштовно. Дані документа лишаються у вашому браузері; email потрібен лише для нагадувань про єдиний податок і ЄСВ.
        </p>
      )}

      {/* Off-screen A4 sheet captured into the PDF. */}
      <div aria-hidden className="pointer-events-none fixed -left-[10000px] top-0">
        {kind === "nakladna" ? <NakladnaDocument ref={docRef} data={{ ...party, items }} /> : null}
        {kind === "akt" ? <ActDocument ref={docRef} data={actData} actDate={date} basis={basis} /> : null}
        {kind === "akt-zvirky" ? <ZvirkaDocument ref={docRef} data={zvirka} /> : null}
      </div>
    </section>
  );
}
