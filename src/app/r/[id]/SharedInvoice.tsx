"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import {
  amountInWordsUk,
  calcLine,
  calcTotal,
  formatDateUk,
  formatIban,
  paymentText,
  type InvoiceData,
} from "@/lib/invoice";
import { buildNbuLink, renderNbuQr, toNbuPayment } from "@/lib/nbu-qr";

/** Same text on the server and in the browser: Node and browsers disagree on the UAH symbol. */
const money = (n: number) =>
  `${new Intl.NumberFormat("uk-UA", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0)} грн`;

type Props = { id: string; data: InvoiceData; paid: boolean; isOwner: boolean; views: number };

export function SharedInvoice({ id, data, paid, isOwner, views }: Props) {
  const total = useMemo(() => calcTotal(data.items), [data.items]);
  const qrLink = useMemo(() => {
    const payment = toNbuPayment({
      name: data.sellerName,
      iban: data.sellerIban,
      taxId: data.sellerTaxId,
      amount: total,
      purpose: `Оплата за рахунком № ${data.number || "—"} від ${formatDateUk(data.date)}`,
    });
    return payment ? buildNbuLink(payment) : null;
  }, [data, total]);
  const [qrSrc, setQrSrc] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOwner) trackEvent("invoice_link_view", { paid });
  }, [isOwner, paid]);

  useEffect(() => {
    if (!qrLink) return;
    let alive = true;
    void renderNbuQr(qrLink).then((src) => alive && setQrSrc(src));
    return () => {
      alive = false;
    };
  }, [qrLink]);

  async function copyDetails() {
    try {
      await navigator.clipboard.writeText(paymentText(data));
      setCopied(true);
      trackEvent("invoice_link_copy", {});
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked */
    }
  }

  const cell = "py-2 pr-2 align-top";

  return (
    <main className="min-h-screen bg-ink px-4 py-6 text-paper print:bg-white print:p-0">
      <div className="mx-auto max-w-3xl">
        {isOwner ? (
          <div className="mb-4 rounded-xl border border-signal/50 bg-signal/10 p-4 text-sm print:hidden">
            Це ваш рахунок — клієнт бачить сторінку без цього блоку.{" "}
            {views ? `Клієнт відкривав його ${views} раз(и).` : "Клієнт ще не відкривав посилання."}{" "}
            <Link href="/account" className="text-signal underline">
              Кабінет →
            </Link>
          </div>
        ) : null}

        <article className="rounded-2xl bg-white p-5 text-[#111] shadow-xl md:p-8 print:rounded-none print:shadow-none">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold md:text-2xl">
                Рахунок на оплату № {data.number || "—"}
              </h1>
              <p className="text-sm text-[#555]">від {formatDateUk(data.date)}</p>
            </div>
            {paid ? (
              <span className="rounded-full bg-[#e3f6c8] px-3 py-1 text-sm font-semibold text-[#2f5d0a]">Оплачено</span>
            ) : null}
            {data.sellerLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.sellerLogo} alt="" className="max-h-14 max-w-[160px] object-contain" />
            ) : null}
          </div>

          <div className="mt-6 grid gap-4 text-sm md:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-[#777]">Отримувач</p>
              <p className="mt-1 font-semibold">{data.sellerName}</p>
              {data.sellerTaxId ? <p>РНОКПП / ЄДРПОУ: {data.sellerTaxId}</p> : null}
              {data.sellerAddress ? <p>{data.sellerAddress}</p> : null}
              <p className="mt-1 font-mono">IBAN: {formatIban(data.sellerIban)}</p>
              {data.sellerBank ? <p>Банк: {data.sellerBank}</p> : null}
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-[#777]">Платник</p>
              <p className="mt-1 font-semibold">{data.buyerName || "—"}</p>
              {data.buyerTaxId ? <p>Код: {data.buyerTaxId}</p> : null}
              {data.buyerAddress ? <p>{data.buyerAddress}</p> : null}
            </div>
          </div>

          <table className="mt-6 w-full text-left text-sm">
            <thead className="border-b border-[#ddd] text-xs text-[#777]">
              <tr>
                <th className={cell}>Найменування</th>
                <th className={`${cell} text-right`}>К-сть</th>
                <th className={`${cell} hidden text-right sm:table-cell`}>Ціна</th>
                <th className="py-2 text-right">Сума</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item) => (
                <tr key={item.id || item.description} className="border-b border-[#eee]">
                  <td className={cell}>{item.description}</td>
                  <td className={`${cell} whitespace-nowrap text-right`}>
                    {item.qty} {item.unit}
                  </td>
                  <td className={`${cell} hidden whitespace-nowrap text-right sm:table-cell`}>
                    {money(Number(String(item.price).replace(",", ".")) || 0)}
                  </td>
                  <td className="whitespace-nowrap py-2 text-right tabular-nums">{money(calcLine(item))}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-4 text-right text-lg font-bold">До сплати: {money(total)}</p>
          <p className="text-right text-sm text-[#555]">{amountInWordsUk(total)}</p>
          {data.note ? <p className="mt-4 text-sm text-[#333]">{data.note}</p> : null}

          {!paid ? (
            <div className="mt-6 flex flex-col items-center gap-4 rounded-xl border border-[#e5e5e5] p-4 sm:flex-row sm:items-start">
              {qrSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qrSrc} alt="QR-код НБУ для оплати" className="h-40 w-40" />
              ) : null}
              <div className="w-full text-sm">
                <p className="font-semibold">Оплатити</p>
                <p className="mt-1 text-[#555]">
                  Відскануйте QR у застосунку банку — реквізити, сума й призначення заповняться самі.
                </p>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row print:hidden">
                  {qrLink ? (
                    <a
                      href={qrLink}
                      onClick={() => trackEvent("invoice_link_pay_click", {})}
                      className="rounded-xl bg-[#111] px-4 py-3 text-center font-semibold text-white sm:hidden"
                    >
                      Оплатити в банку
                    </a>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => void copyDetails()}
                    className="rounded-xl border border-[#ccc] px-4 py-3 font-semibold"
                  >
                    {copied ? "Скопійовано ✓" : "Скопіювати реквізити"}
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="rounded-xl border border-[#ccc] px-4 py-3 font-semibold"
                  >
                    Зберегти PDF / друк
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </article>

        <div className="mt-4 space-y-2 text-xs text-muted print:hidden">
          <p>
            Rakhuno не перевіряє отримувача. Перед оплатою переконайтеся, що реквізити надіслав ваш
            підрядник.{" "}
            <a href={`mailto:info@rakhuno.com?subject=${encodeURIComponent(`Скарга на рахунок ${id}`)}`} className="underline">
              Поскаржитися
            </a>
          </p>
        </div>

        <div className="mt-6 rounded-xl border border-white/10 bg-ink/60 p-4 text-sm print:hidden">
          Рахунок створено в <span className="font-semibold text-paper">Rakhuno</span> — безкоштовний
          рахунок-фактура з QR для ФОП.{" "}
          <Link
            href="/invoice?utm_source=invoice_link&utm_medium=referral"
            onClick={() => trackEvent("invoice_link_signup_click", {})}
            className="text-signal underline-offset-2 hover:underline"
          >
            Створити свій рахунок →
          </Link>
        </div>
      </div>
    </main>
  );
}
