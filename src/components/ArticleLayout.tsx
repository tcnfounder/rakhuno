import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

export function ArticleLayout({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-ink">
      <div className="grid-atmosphere min-h-screen">
        <SiteHeader />
        <article className="mx-auto max-w-3xl px-5 py-12 md:px-10 md:py-16">
          <p className="text-sm text-signal">
            <Link href="/guides" className="hover:underline">
              Гіди
            </Link>
          </p>
          <h1 className="mt-4 font-display text-3xl font-semibold leading-tight text-paper md:text-5xl">
            {title}
          </h1>
          <p className="mt-4 text-lg text-mist">{description}</p>
          <div className="prose-rakhuno mt-10 space-y-5 text-base leading-relaxed text-paper/90">
            {children}
          </div>
          <div className="mt-12 rounded-2xl border border-line bg-ink-2/80 p-6">
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
          <p className="mt-8 text-xs text-muted">
            Rakhuno не є податковим консультантом. Перевіряйте актуальні вимоги ДПС / бухгалтера.
          </p>
        </article>
      </div>
    </main>
  );
}
