import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

/** Shared page chrome: same max width + padding everywhere. */
export function SiteShell({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <main className={`min-h-screen bg-ink text-paper ${className}`}>
      <div className="grid-atmosphere min-h-screen">
        <SiteHeader />
        <div className="mx-auto w-full max-w-content px-5 py-12 md:px-10 md:py-16">{children}</div>
      </div>
    </main>
  );
}

export function PageFooterNote() {
  return (
    <p className="mt-10 text-xs text-muted">
      Rakhuno не є податковим консультантом. Перевіряйте актуальні вимоги ДПС / бухгалтера.
    </p>
  );
}

export function InvoiceCta() {
  return (
    <div className="mt-12 border-t border-line pt-8">
      <p className="font-display text-xl text-paper">Потрібен рахунок зараз?</p>
      <p className="mt-2 text-sm text-mist">
        Створіть рахунок-фактуру в Rakhuno за 2 хвилини. Email — для нагадувань про податки.
      </p>
      <Link
        href="/invoice"
        className="mt-5 inline-flex rounded-full bg-signal px-5 py-2.5 font-semibold text-ink transition hover:bg-white"
      >
        Безкоштовний рахунок
      </Link>
    </div>
  );
}

/** Compact mid-article CTA — keeps guide → product path short for SEO + conversion. */
export function MidInvoiceCta({
  title = "Створити рахунок-фактуру зараз",
  text = "Заповніть реквізити ФОП і позиції — PDF завантажиться в браузері за ~2 хвилини.",
}: {
  title?: string;
  text?: string;
}) {
  return (
    <aside className="not-prose my-8 rounded-2xl border border-signal/40 bg-signal/5 px-5 py-5">
      <p className="font-display text-lg text-paper">{title}</p>
      <p className="mt-1 text-sm text-mist">{text}</p>
      <Link
        href="/invoice"
        className="mt-4 inline-flex rounded-full bg-signal px-4 py-2 text-sm font-semibold text-ink transition hover:bg-white"
      >
        Відкрити рахунок →
      </Link>
    </aside>
  );
}
