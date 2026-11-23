"use client";

import { useEffect, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import { formatDateUk, formatUah } from "@/lib/invoice";
import type { InvoiceLinkSummary } from "@/lib/invoice-links";

const btn = "rounded-full border border-white/15 px-3 py-1 text-xs text-mist hover:border-signal hover:text-signal";

export function InvoiceLinks() {
  const [links, setLinks] = useState<InvoiceLinkSummary[] | null>(null);
  const [copied, setCopied] = useState("");

  async function load() {
    const res = await fetch("/api/links").catch(() => null);
    if (!res?.ok) return setLinks([]);
    setLinks(((await res.json()) as { links: InvoiceLinkSummary[] }).links);
  }

  useEffect(() => {
    void load();
  }, []);

  async function change(id: string, body: { paid?: boolean; revoke?: boolean }) {
    if (body.revoke && !window.confirm("Відкликати посилання? Клієнт більше не зможе відкрити рахунок.")) return;
    await fetch(`/api/links/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).catch(() => null);
    trackEvent(body.revoke ? "invoice_link_revoke" : body.paid ? "invoice_link_mark_paid" : "invoice_link_mark_unpaid", {});
    void load();
  }

  async function copy(id: string) {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/r/${id}`);
      setCopied(id);
      window.setTimeout(() => setCopied(""), 2000);
    } catch {
      /* clipboard blocked */
    }
  }

  if (!links) return null;

  return (
    <section className="mt-6 rounded-2xl border border-white/10 bg-ink/60 p-5">
      <h2 className="font-display text-xl text-paper">Рахунки-посилання</h2>
      {!links.length ? (
        <p className="mt-2 text-sm text-mist">
          Після PDF у редакторі натисніть «Створити посилання» — клієнт відкриє рахунок і оплатить за QR, а тут ви
          побачите, чи він його відкрив.
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-white/10">
          {links.map((l) => (
            <li key={l.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="text-paper">
                  № {l.number || "—"} · {l.buyerName || "—"} ·{" "}
                  <span className="tabular-nums">{formatUah(l.total)}</span>
                </p>
                <p className="text-xs text-mist">
                  {formatDateUk(l.date)} ·{" "}
                  {l.paidAt ? (
                    <span className="text-signal">Оплачено</span>
                  ) : l.firstViewedAt ? (
                    <span className="text-paper">Клієнт відкрив ({l.views})</span>
                  ) : (
                    "Ще не відкрито"
                  )}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" className={btn} onClick={() => void change(l.id, { paid: !l.paidAt })}>
                  {l.paidAt ? "Не оплачено" : "Позначити оплаченим"}
                </button>
                <button type="button" className={btn} onClick={() => void copy(l.id)}>
                  {copied === l.id ? "Скопійовано ✓" : "Копіювати"}
                </button>
                <a className={btn} href={`/r/${l.id}`} target="_blank" rel="noopener noreferrer">
                  Відкрити
                </a>
                <button type="button" className={btn} onClick={() => void change(l.id, { revoke: true })}>
                  Відкликати
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
