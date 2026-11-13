import Link from "next/link";
import { BrandLockup } from "@/components/BrandLockup";

const columns: { title: string; links: { href: string; label: string; hrefLang?: string }[] }[] = [
  {
    title: "Інструменти",
    links: [
      { href: "/invoice", label: "Рахунок-фактура онлайн" },
      { href: "/suma-propysom", label: "Сума прописом" },
      { href: "/kalkulyator-podatkiv-fop", label: "Калькулятор податків ФОП" },
      { href: "/guides/blank-rakhunku-faktury", label: "Бланки Word і Excel" },
    ],
  },
  {
    title: "Документи",
    links: [
      { href: "/guides/rahunok-faktura", label: "Що таке рахунок-фактура" },
      { href: "/guides/zrazok-rahunku-faktury", label: "Зразок рахунку" },
      { href: "/guides/rakhunok-na-oplatu", label: "Рахунок на оплату" },
      { href: "/guides/akt-vykonanykh-robit", label: "Акт виконаних робіт" },
      { href: "/guides/vydatkova-nakladna", label: "Видаткова накладна" },
      { href: "/blanky", label: "Бланки Word і Excel" },
    ],
  },
  {
    title: "ФОП і податки",
    links: [
      { href: "/guides/vystavyty-rakhunok", label: "Як виставити рахунок" },
      { href: "/guides/fop-3-grupa", label: "ФОП 3 група" },
      { href: "/guides/yedynyy-podatok", label: "Єдиний податок" },
      { href: "/guides/podatky-fop", label: "Податки ФОП: чекліст" },
      { href: "/guides", label: "Усі гіди" },
    ],
  },
  {
    title: "Rakhuno",
    links: [
      { href: "/#yak-pratsyuye", label: "Як це працює" },
      { href: "/en", label: "English", hrefLang: "en" },
      { href: "/privacy", label: "Конфіденційність" },
      { href: "/terms", label: "Умови використання" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-ink text-sm">
      <div className="mx-auto max-w-content px-5 pb-8 pt-14 md:px-10 md:pt-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_repeat(4,minmax(0,1fr))] lg:gap-8">
          <div className="max-w-xs">
            <BrandLockup size="sm" href="/" />
            <p className="mt-4 leading-relaxed text-mist">
              Безкоштовний онлайн-рахунок для ФОП: PDF за дві хвилини, акт і накладна з того самого
              рахунку, нагадування про податки.
            </p>
            <a
              href="mailto:info@rakhuno.com"
              className="mt-5 inline-flex items-center gap-2 text-paper transition hover:text-signal"
            >
              info@rakhuno.com
            </a>
          </div>

          <nav
            aria-label="Підвал"
            className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4 lg:col-span-4"
          >
            {columns.map((col) => (
              <div key={col.title}>
                <p className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-paper">
                  {col.title}
                </p>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        hrefLang={l.hrefLang}
                        className="text-muted transition hover:text-signal"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-line pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Rakhuno</p>
          <p className="max-w-xl sm:text-right">
            Не є податковою консультацією. Строки загальні — перевіряйте актуальні вимоги ДПС.
          </p>
        </div>
      </div>
    </footer>
  );
}
