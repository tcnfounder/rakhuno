import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteShell } from "@/components/SiteShell";
import { PRO_FEATURES_UK } from "@/lib/pro";
import { DEFAULT_OG_IMAGE } from "@/lib/site";
import { ProWaitlistForm } from "./ProWaitlistForm";

export const metadata: Metadata = {
  title: "Rakhuno Pro і кабінет бухгалтера — скоро",
  description:
    "Рахунок-посилання з оплатою за QR, автонагадування клієнтам, а для бухгалтерів — виписки клієнтів у Telegram і книга обліку доходів зі ШІ.",
  alternates: { canonical: "https://rakhuno.com/pro" },
  robots: { index: false, follow: true },
  openGraph: {
    images: [DEFAULT_OG_IMAGE],
    title: "Rakhuno Pro і кабінет бухгалтера — скоро",
    url: "https://rakhuno.com/pro",
  },
};

const ACCOUNTANT_FEATURES = [
  "Клієнти надсилають виписки з будь-якого банку в Telegram-бот — без нагадувань у Viber",
  "ШІ відділяє дохід від повернень і власних переказів, валюту перераховує за курсом НБУ",
  "Книга обліку доходів по кожному ФОП — в Excel і PDF",
  "Ліміти доходу й найближчі терміни всіх клієнтів на одному екрані",
  "Автонагадування клієнтам: сума податку, реквізити, дата",
];

const card = "rounded-2xl border border-white/10 bg-ink/60 p-5 md:p-6";

export default function ProPage() {
  return (
    <>
      <SiteShell>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-signal">Скоро</p>
        <h1 className="mt-2 font-display text-4xl font-semibold md:text-5xl">
          Rakhuno Pro і кабінет бухгалтера
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-mist">
          Безкоштовний рахунок-фактура залишається безкоштовним. Pro — для тих, хто хоче, щоб клієнти
          платили швидше, а бухгалтери витрачали менше часу на виписки.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <section className={card}>
            <h2 className="font-display text-2xl text-paper">Pro для ФОП</h2>
            <p className="mt-1 text-paper">
              <span className="font-display text-3xl font-semibold text-signal">149 грн</span> / міс
            </p>
            <ul className="mt-4 space-y-2 text-mist">
              {PRO_FEATURES_UK.map((f) => (
                <li key={f}>· {f}</li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-paper">Для списку очікування — перший місяць безкоштовно.</p>
          </section>

          <section id="buhgalteram" className={`${card} scroll-mt-24`}>
            <h2 className="font-display text-2xl text-paper">Кабінет бухгалтера</h2>
            <p className="mt-1 text-paper">
              від <span className="font-display text-3xl font-semibold text-signal">690 грн</span> / міс
            </p>
            <ul className="mt-4 space-y-2 text-mist">
              {ACCOUNTANT_FEATURES.map((f) => (
                <li key={f}>· {f}</li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-paper">
              15 днів безкоштовно на ваших реальних клієнтах. Ціна залежить від кількості ФОП: до 15 — 690
              грн, до 50 — 1 490 грн, до 150 — 2 990 грн на місяць.
            </p>
          </section>
        </div>

        <div className="mt-10 max-w-2xl">
          <ProWaitlistForm />
        </div>

        <p className="mt-10 max-w-2xl text-xs text-muted">
          Rakhuno не є податковим консультантом. Розрахунки ШІ — чернетка, яку перевіряє бухгалтер.
        </p>
      </SiteShell>
      <SiteFooter />
    </>
  );
}
