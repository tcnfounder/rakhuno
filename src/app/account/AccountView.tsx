"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import { isSignedIn, syncAccount, type AccountSnapshot } from "@/lib/cloud";
import { formatDateUk, formatUah } from "@/lib/invoice";
import { InvoiceLinks } from "./InvoiceLinks";

const card = "rounded-2xl border border-white/10 bg-ink/60 p-5";

export function AccountView() {
  const [account, setAccount] = useState<AccountSnapshot | null>(null);

  useEffect(() => {
    const toLogin = () => window.location.replace("/login?next=/account");
    if (!isSignedIn()) return toLogin();
    void syncAccount().then((a) => (a ? setAccount(a) : toLogin()));
  }, []);

  async function logout() {
    trackEvent("logout");
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    window.location.replace("/");
  }

  if (!account) return <p className="text-mist" aria-live="polite">Завантаження…</p>;

  const p = account.profile;
  const iban = (p?.sellerIban || "").replace(/\s/g, "");

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-semibold">Кабінет</h1>
          <p className="mt-2 text-mist">{account.email}</p>
        </div>
        <div className="flex gap-3">
          <Link href="/invoice" className="rounded-xl bg-signal px-5 py-3 font-semibold text-ink">
            Новий рахунок
          </Link>
          <button
            type="button"
            onClick={() => void logout()}
            className="rounded-xl border border-white/15 px-5 py-3 text-paper hover:border-signal"
          >
            Вийти
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <section className={card}>
          <p className="text-sm text-mist">ФОП</p>
          <p className="mt-1 font-semibold text-paper">{p?.sellerName || "Ще не заповнено"}</p>
          {iban ? <p className="mt-1 text-sm text-mist">IBAN …{iban.slice(-4)}</p> : null}
          {p?.fopGroup ? <p className="text-sm text-mist">{p.fopGroup} група</p> : null}
        </section>
        <section className={card}>
          <p className="text-sm text-mist">Рахунків у кабінеті</p>
          <p className="mt-1 font-display text-3xl text-paper">{account.invoices.length}</p>
        </section>
        <section className={card}>
          <p className="text-sm text-mist">Клієнтів</p>
          <p className="mt-1 font-display text-3xl text-paper">{account.clients.length}</p>
        </section>
      </div>

      <InvoiceLinks />

      <section className={`${card} mt-6`}>
        <h2 className="font-display text-xl text-paper">Останні рахунки</h2>
        {account.invoices.length ? (
          <div className="mt-3">
            <table className="w-full text-left text-sm">
              <thead className="text-mist">
                <tr>
                  <th className="py-2 pr-3 font-normal">Дата</th>
                  <th className="py-2 pr-3 font-normal">№</th>
                  <th className="py-2 pr-3 font-normal">Клієнт</th>
                  <th className="py-2 text-right font-normal">Сума</th>
                </tr>
              </thead>
              <tbody>
                {account.invoices.slice(0, 50).map((h) => (
                  <tr key={h.id} className="border-t border-white/10 text-paper">
                    <td className="py-2 pr-3 whitespace-nowrap">{formatDateUk(h.date)}</td>
                    <td className="py-2 pr-3">{h.number || "—"}</td>
                    <td className="py-2 pr-3">{h.buyerName || "—"}</td>
                    <td className="py-2 text-right whitespace-nowrap tabular-nums">{formatUah(h.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-2 text-sm text-mist">
            Тут з’являться рахунки, які ви створите після входу (і ті, що вже були в цьому браузері).
          </p>
        )}
        <p className="mt-3 text-xs text-muted">Повторити рахунок можна в редакторі: блок «Останні рахунки».</p>
      </section>

      <section className="mt-6 rounded-2xl border border-signal/50 bg-ink/80 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-signal">Скоро</p>
        <p className="mt-1 font-semibold text-paper">Rakhuno Pro і кабінет бухгалтера</p>
        <p className="mt-1 text-sm text-mist">Рахунок-посилання з оплатою, нагадування клієнтам, виписки зі ШІ.</p>
        <Link href="/pro" className="mt-3 inline-block text-sm text-signal hover:underline">
          Детальніше →
        </Link>
      </section>
    </div>
  );
}
